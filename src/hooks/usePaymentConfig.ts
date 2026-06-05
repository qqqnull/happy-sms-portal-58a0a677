import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_PAYMENT_DOMAIN = 'payusdt.shop';
const DEFAULT_PAYMENT_PLATFORM = '2026sms';

const cleanDomain = (value?: string | null) =>
  (value || '').trim().replace(/^https?:\/\//, '').replace(/\/+$/, '');

const fetchConfig = async () => {
  const { data, error } = await supabase
    .from('app_settings')
    .select('key,value')
    .in('key', ['payment_domain', 'payment_platform']);

  if (error) throw error;

  const d = cleanDomain(data?.find((s: any) => s.key === 'payment_domain')?.value);
  const p = data?.find((s: any) => s.key === 'payment_platform')?.value;
  return {
    domain: d || DEFAULT_PAYMENT_DOMAIN,
    platform: p || DEFAULT_PAYMENT_PLATFORM,
  };
};

export const usePaymentConfig = () => {
  const [domain, setDomain] = useState(DEFAULT_PAYMENT_DOMAIN);
  const [platform, setPlatform] = useState(DEFAULT_PAYMENT_PLATFORM);
  const [loading, setLoading] = useState(true);
  const latest = useRef({ domain: DEFAULT_PAYMENT_DOMAIN, platform: DEFAULT_PAYMENT_PLATFORM });

  useEffect(() => {
    (async () => {
      try {
        const c = await fetchConfig();
        latest.current = c;
        setDomain(c.domain);
        setPlatform(c.platform);
      } catch (e) {
        console.error('Failed to fetch payment config:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const buildPaymentUrl = (orderId: string, amount: number | string) => {
    const amt = typeof amount === 'number' ? amount.toFixed(2) : amount;
    const { domain: d, platform: p } = latest.current;
    return `https://${d}/?platform=${encodeURIComponent(p)}&order_id=${encodeURIComponent(orderId)}&amount=${amt}`;
  };

  // Always fetch latest from DB right before redirect to avoid stale cache on first paint.
  const buildPaymentUrlFresh = async (orderId: string, amount: number | string) => {
    const c = await fetchConfig();
    latest.current = c;
    setDomain(c.domain);
    setPlatform(c.platform);
    return buildPaymentUrl(orderId, amount);
  };

  return { domain, platform, loading, buildPaymentUrl, buildPaymentUrlFresh };
};