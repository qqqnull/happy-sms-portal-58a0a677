DROP POLICY IF EXISTS "Users can update locked numbers" ON public.phone_numbers;
CREATE POLICY "Users can update locked numbers"
ON public.phone_numbers FOR UPDATE
USING (
  locked_by = auth.uid()
  OR is_available = true
  OR (is_persistent = false AND owner_user_id IS NULL AND locked_until IS NOT NULL AND locked_until <= now())
);