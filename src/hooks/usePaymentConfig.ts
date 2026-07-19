import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_PAYMENT_DOMAIN = 'payusdt.shop';
const PAYMENT_PLATFORM = '2026sms';

const cleanDomain = (raw?: string | null) =>
  (raw || '').trim().replace(/^https?:\/\//i, '').replace(/\/+$/, '');

const fetchDomain = async (): Promise<string> => {
  const { data, error } = await supabase
    .from('app_settings')
    .select('key,value')
    .eq('key', 'payment_domain')
    .maybeSingle();
  if (error) throw error;
  return cleanDomain(data?.value) || DEFAULT_PAYMENT_DOMAIN;
};

const buildUrl = (domain: string, orderId: string, amount: string) =>
  `https://${domain}/?platform=${encodeURIComponent(PAYMENT_PLATFORM)}&order_id=${encodeURIComponent(orderId)}&amount=${amount}`;

export const usePaymentConfig = () => {
  const [domain, setDomain] = useState(DEFAULT_PAYMENT_DOMAIN);
  const [loading, setLoading] = useState(true);
  const latest = useRef(DEFAULT_PAYMENT_DOMAIN);

  useEffect(() => {
    (async () => {
      try {
        const d = await fetchDomain();
        latest.current = d;
        setDomain(d);
      } catch (e) {
        console.error('Failed to fetch payment domain:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Always fetch latest domain from DB right before redirect.
  const buildPaymentUrlFresh = async (orderId: string, amount: number | string): Promise<string> => {
    const amt = typeof amount === 'number' ? amount.toFixed(2) : amount;
    const d = await fetchDomain();
    latest.current = d;
    setDomain(d);
    return buildUrl(d, orderId, amt);
  };

  return { domain, platform: PAYMENT_PLATFORM, loading, buildPaymentUrlFresh };
};