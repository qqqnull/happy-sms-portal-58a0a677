-- Create phone_numbers table to store available phone numbers for each country
CREATE TABLE public.phone_numbers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_code TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  locked_until TIMESTAMP WITH TIME ZONE,
  locked_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(country_code, phone_number)
);

-- Enable RLS
ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;

-- Phone numbers are publicly readable
CREATE POLICY "Phone numbers are publicly readable"
ON public.phone_numbers
FOR SELECT
USING (true);

-- Admins can manage phone numbers
CREATE POLICY "Admins can manage phone numbers"
ON public.phone_numbers
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can update phone numbers they locked
CREATE POLICY "Users can update locked numbers"
ON public.phone_numbers
FOR UPDATE
USING (locked_by = auth.uid() OR is_available = true);

-- Create index for faster queries
CREATE INDEX idx_phone_numbers_country_available ON public.phone_numbers(country_code, is_available);