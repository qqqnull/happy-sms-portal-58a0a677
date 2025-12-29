-- Create country_services table to store services available per country with specific prices
CREATE TABLE IF NOT EXISTS public.country_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  price NUMERIC NOT NULL DEFAULT 1.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(country_id, service_id)
);

-- Enable RLS
ALTER TABLE public.country_services ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Country services are publicly readable" 
ON public.country_services 
FOR SELECT 
USING (true);

-- Create policy for admin management
CREATE POLICY "Admins can manage country services" 
ON public.country_services 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_country_services_country_id ON public.country_services(country_id);
CREATE INDEX idx_country_services_service_id ON public.country_services(service_id);

-- Add description column to services table if not exists
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS description TEXT;

-- Add name_en column to services table for English names
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS name_en TEXT;