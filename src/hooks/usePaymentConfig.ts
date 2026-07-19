import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_REDIRECT_API = 'https://clever-switchboard.lovable.app/api/public/redirect';
const REDIRECT_KEY = 'syt';

const fetchRedirectApi = async (): Promise<string> => {
  const { data, error } = await supabase
    .from('app_settings')
    .select('key,value')
    .eq('key', 'payment_redirect_api')
    .maybeSingle();
  if (error) throw error;
  const url = (data?.value || '').trim();
  return url || DEFAULT_REDIRECT_API;
};

const requestRedirectUrl = async (apiUrl: string, orderId: string, amount: string): Promise<string> => {
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: REDIRECT_KEY, order_id: orderId, amount }),
  });
  if (!res.ok) throw new Error(`Redirect API HTTP ${res.status}`);
  const json = await res.json();
  if (!json?.url) throw new Error('Redirect API missing url field');
  return json.url as string;
};

export const usePaymentConfig = () => {
  const [apiUrl, setApiUrl] = useState(DEFAULT_REDIRECT_API);
  const [loading, setLoading] = useState(true);
  const latest = useRef(DEFAULT_REDIRECT_API);

  useEffect(() => {
    (async () => {
      try {
        const u = await fetchRedirectApi();
        latest.current = u;
        setApiUrl(u);
      } catch (e) {
        console.error('Failed to fetch redirect api config:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Always request the freshest target URL right before redirect.
  const buildPaymentUrlFresh = async (orderId: string, amount: number | string): Promise<string> => {
    const amt = typeof amount === 'number' ? amount.toFixed(2) : amount;
    const u = await fetchRedirectApi();
    latest.current = u;
    setApiUrl(u);
    return await requestRedirectUrl(u, orderId, amt);
  };

  return { apiUrl, loading, buildPaymentUrlFresh };
};