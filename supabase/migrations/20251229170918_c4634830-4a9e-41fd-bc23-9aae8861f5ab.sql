-- Add online_count to countries table (100-1000, China has most)
ALTER TABLE public.countries ADD COLUMN IF NOT EXISTS online_count integer DEFAULT 100;

-- Add success_rate to services table (91-99%)
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS success_rate integer DEFAULT 95;

-- Update some sample data for online counts (China gets highest)
UPDATE public.countries SET online_count = 
  CASE 
    WHEN code = 'CN' THEN 1000
    WHEN code = 'US' THEN 850
    WHEN code = 'RU' THEN 780
    WHEN code = 'IN' THEN 720
    WHEN code = 'UK' THEN 650
    ELSE FLOOR(RANDOM() * 400 + 100)::integer
  END
WHERE online_count = 100 OR online_count IS NULL;

-- Update services with random success rates between 91-99
UPDATE public.services SET success_rate = FLOOR(RANDOM() * 9 + 91)::integer
WHERE success_rate = 95 OR success_rate IS NULL;