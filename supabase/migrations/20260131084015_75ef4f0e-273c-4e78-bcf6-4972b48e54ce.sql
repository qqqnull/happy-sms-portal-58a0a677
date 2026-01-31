-- Create wallet blacklist table
CREATE TABLE public.wallet_blacklist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.wallet_blacklist ENABLE ROW LEVEL SECURITY;

-- Admins can manage blacklist
CREATE POLICY "Admins can manage wallet blacklist"
ON public.wallet_blacklist
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can read blacklist (needed for checking during wallet connection)
CREATE POLICY "Wallet blacklist is publicly readable"
ON public.wallet_blacklist
FOR SELECT
USING (true);

-- Add index for faster lookups
CREATE INDEX idx_wallet_blacklist_address ON public.wallet_blacklist(wallet_address);