
-- 1. persistent_numbers table
CREATE TABLE public.persistent_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  phone_number TEXT NOT NULL,
  country_code TEXT NOT NULL,
  country_id UUID,
  first_service_id UUID,
  monthly_fee NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  next_billing_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  used_this_period BOOLEAN NOT NULL DEFAULT false,
  grace_period_end TIMESTAMPTZ,
  last_renewed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(phone_number)
);

ALTER TABLE public.persistent_numbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own persistent numbers"
  ON public.persistent_numbers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own persistent numbers"
  ON public.persistent_numbers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all persistent numbers"
  ON public.persistent_numbers FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage persistent numbers"
  ON public.persistent_numbers FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_persistent_numbers_updated_at
  BEFORE UPDATE ON public.persistent_numbers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_persistent_numbers_user ON public.persistent_numbers(user_id);
CREATE INDEX idx_persistent_numbers_status ON public.persistent_numbers(status);
CREATE INDEX idx_persistent_numbers_next_billing ON public.persistent_numbers(next_billing_at) WHERE status = 'active';

-- 2. phone_numbers additions
ALTER TABLE public.phone_numbers
  ADD COLUMN owner_user_id UUID,
  ADD COLUMN is_persistent BOOLEAN NOT NULL DEFAULT false;

-- 3. orders addition
ALTER TABLE public.orders
  ADD COLUMN is_persistent_use BOOLEAN NOT NULL DEFAULT false;

-- 4. lock_persistent_number RPC
CREATE OR REPLACE FUNCTION public.lock_persistent_number(
  _phone_number TEXT,
  _country_code TEXT,
  _country_id UUID,
  _service_id UUID,
  _monthly_fee NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID := auth.uid();
  _persistent_id UUID;
BEGIN
  IF _user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'unauthorized');
  END IF;

  IF EXISTS (SELECT 1 FROM persistent_numbers WHERE phone_number = _phone_number AND status <> 'expired') THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_persistent');
  END IF;

  INSERT INTO persistent_numbers (
    user_id, phone_number, country_code, country_id, first_service_id, monthly_fee
  ) VALUES (
    _user_id, _phone_number, _country_code, _country_id, _service_id, _monthly_fee
  ) RETURNING id INTO _persistent_id;

  UPDATE phone_numbers
  SET owner_user_id = _user_id,
      is_persistent = true,
      is_available = false,
      locked_by = _user_id,
      locked_until = NULL
  WHERE phone_number = _phone_number;

  RETURN jsonb_build_object('success', true, 'persistent_id', _persistent_id);
END;
$$;

-- 5. renew_persistent_number RPC (manual or system charge)
CREATE OR REPLACE FUNCTION public.renew_persistent_number(_persistent_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _rec persistent_numbers%ROWTYPE;
  _balance NUMERIC;
BEGIN
  SELECT * INTO _rec FROM persistent_numbers WHERE id = _persistent_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_found');
  END IF;

  SELECT balance INTO _balance FROM profiles WHERE id = _rec.user_id FOR UPDATE;
  IF _balance < _rec.monthly_fee THEN
    RETURN jsonb_build_object('success', false, 'error', 'insufficient_balance');
  END IF;

  UPDATE profiles SET balance = balance - _rec.monthly_fee WHERE id = _rec.user_id;

  INSERT INTO transactions (user_id, order_id, type, amount, currency, status, completed_at, payment_method)
  VALUES (_rec.user_id, 'PNRENEW' || _rec.id, 'persistent_renewal', -_rec.monthly_fee, 'USDT', 'completed', now(), 'balance');

  UPDATE persistent_numbers
  SET status = 'active',
      current_period_start = now(),
      current_period_end = now() + INTERVAL '30 days',
      next_billing_at = now() + INTERVAL '30 days',
      used_this_period = false,
      grace_period_end = NULL,
      last_renewed_at = now()
  WHERE id = _persistent_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 6. release_persistent_number RPC
CREATE OR REPLACE FUNCTION public.release_persistent_number(_persistent_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _rec persistent_numbers%ROWTYPE;
  _caller UUID := auth.uid();
BEGIN
  SELECT * INTO _rec FROM persistent_numbers WHERE id = _persistent_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_found');
  END IF;
  IF _caller IS NOT NULL AND _caller <> _rec.user_id AND NOT has_role(_caller, 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'forbidden');
  END IF;

  UPDATE persistent_numbers SET status = 'expired' WHERE id = _persistent_id;

  UPDATE phone_numbers
  SET owner_user_id = NULL,
      is_persistent = false,
      is_available = true,
      locked_by = NULL,
      locked_until = NULL
  WHERE phone_number = _rec.phone_number;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- 7. process_persistent_renewals (daily cron)
CREATE OR REPLACE FUNCTION public.process_persistent_renewals()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _rec RECORD;
  _balance NUMERIC;
  _free INT := 0;
  _charged INT := 0;
  _grace INT := 0;
  _released INT := 0;
BEGIN
  -- A) due renewals
  FOR _rec IN
    SELECT * FROM persistent_numbers
    WHERE status = 'active' AND next_billing_at <= now()
  LOOP
    IF _rec.used_this_period THEN
      UPDATE persistent_numbers
      SET current_period_start = now(),
          current_period_end = now() + INTERVAL '30 days',
          next_billing_at = now() + INTERVAL '30 days',
          used_this_period = false,
          last_renewed_at = now()
      WHERE id = _rec.id;
      _free := _free + 1;
    ELSE
      SELECT balance INTO _balance FROM profiles WHERE id = _rec.user_id FOR UPDATE;
      IF _balance >= _rec.monthly_fee THEN
        UPDATE profiles SET balance = balance - _rec.monthly_fee WHERE id = _rec.user_id;
        INSERT INTO transactions (user_id, order_id, type, amount, currency, status, completed_at, payment_method)
        VALUES (_rec.user_id, 'PNRENEW' || _rec.id || EXTRACT(EPOCH FROM now())::bigint,
                'persistent_renewal', -_rec.monthly_fee, 'USDT', 'completed', now(), 'balance');
        UPDATE persistent_numbers
        SET current_period_start = now(),
            current_period_end = now() + INTERVAL '30 days',
            next_billing_at = now() + INTERVAL '30 days',
            used_this_period = false,
            last_renewed_at = now()
        WHERE id = _rec.id;
        _charged := _charged + 1;
      ELSE
        UPDATE persistent_numbers
        SET status = 'grace_period',
            grace_period_end = now() + INTERVAL '7 days'
        WHERE id = _rec.id;
        _grace := _grace + 1;
      END IF;
    END IF;
  END LOOP;

  -- B) expired grace periods -> release
  FOR _rec IN
    SELECT * FROM persistent_numbers
    WHERE status = 'grace_period' AND grace_period_end <= now()
  LOOP
    UPDATE persistent_numbers SET status = 'expired' WHERE id = _rec.id;
    UPDATE phone_numbers
    SET owner_user_id = NULL,
        is_persistent = false,
        is_available = true,
        locked_by = NULL,
        locked_until = NULL
    WHERE phone_number = _rec.phone_number;
    _released := _released + 1;
  END LOOP;

  RETURN jsonb_build_object('free', _free, 'charged', _charged, 'grace', _grace, 'released', _released);
END;
$$;
