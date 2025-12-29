-- Add unique constraint for country_services upsert
ALTER TABLE public.country_services 
ADD CONSTRAINT country_services_country_service_unique 
UNIQUE (country_id, service_id);

-- Add unique constraint for services name
ALTER TABLE public.services
ADD CONSTRAINT services_name_unique UNIQUE (name);