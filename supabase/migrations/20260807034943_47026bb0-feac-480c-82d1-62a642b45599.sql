CREATE OR REPLACE FUNCTION public.claim_or_generate_number(_country_code text, _generated_number text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid := auth.uid();
  _rec phone_numbers%ROWTYPE;
  _lock_until timestamptz := now() + interval '30 minutes';
  _new_number text;
BEGIN
  IF _user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'unauthorized');
  END IF;

  -- 已有有效锁定
  SELECT * INTO _rec FROM phone_numbers
  WHERE country_code = _country_code AND locked_by = _user_id AND locked_until > now()
  LIMIT 1;
  IF FOUND THEN
    RETURN jsonb_build_object('success', true, 'id', _rec.id, 'phone_number', _rec.phone_number,
      'locked_until', _rec.locked_until, 'generated', false);
  END IF;

  -- 空闲号码
  SELECT * INTO _rec FROM phone_numbers
  WHERE country_code = _country_code AND is_persistent = false
    AND is_available = true AND locked_by IS NULL
  LIMIT 1 FOR UPDATE SKIP LOCKED;

  -- 锁定已过期号码
  IF NOT FOUND THEN
    SELECT * INTO _rec FROM phone_numbers
    WHERE country_code = _country_code AND is_persistent = false
      AND owner_user_id IS NULL AND locked_until IS NOT NULL AND locked_until <= now()
    LIMIT 1 FOR UPDATE SKIP LOCKED;
  END IF;

  IF FOUND THEN
    UPDATE phone_numbers
    SET locked_by = _user_id, locked_until = _lock_until, is_available = false
    WHERE id = _rec.id;
    RETURN jsonb_build_object('success', true, 'id', _rec.id, 'phone_number', _rec.phone_number,
      'locked_until', _lock_until, 'generated', false);
  END IF;

  -- 自动生成新号码
  _new_number := _generated_number;
  IF _new_number IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'no_number');
  END IF;

  INSERT INTO phone_numbers (country_code, phone_number, is_available, is_persistent, locked_by, locked_until)
  VALUES (_country_code, _new_number, false, false, _user_id, _lock_until)
  RETURNING * INTO _rec;

  RETURN jsonb_build_object('success', true, 'id', _rec.id, 'phone_number', _rec.phone_number,
    'locked_until', _lock_until, 'generated', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_or_generate_number(text, text) TO authenticated;