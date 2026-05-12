import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_PAYMENT_DOMAIN = 'payusdt.buzz';
const DEFAULT_PAYMENT_PLATFORM = '2026sms';

export const usePaymentConfig = () => {
  const [domain, setDomain] = useState(DEFAULT_PAYMENT_DOMAIN);
  const [platform, setPlatform] = useState(DEFAULT_PAYMENT_PLATFORM);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('app_settings')
          .select('key,value')
          .in('key', ['payment_domain', 'payment_platform']);
        if (data) {
          const d = data.find((s: any) => s.key === 'payment_domain')?.value;
          const p = data.find((s: any) => s.key === 'payment_platform')?.value;
          if (d) setDomain(d.replace(/^https?:\/\//, '').replace(/\/$/, ''));
          if (p) setPlatform(p);
        }
      } catch (e) {
        console.error('Failed to fetch payment config:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const buildPaymentUrl = (orderId: string, amount: number | string) => {
    const amt = typeof amount === 'number' ? amount.toFixed(2) : amount;
    return `https://${domain}/?platform=${encodeURIComponent(platform)}&order_id=${encodeURIComponent(orderId)}&amount=${amt}`;
  };

  return { domain, platform, loading, buildPaymentUrl };
};