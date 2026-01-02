import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const DEFAULT_SUPPORT_LINK = 'https://t.me/support';

export const useSupportLink = () => {
  const [supportLink, setSupportLink] = useState(DEFAULT_SUPPORT_LINK);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupportLink = async () => {
      try {
        const { data, error } = await supabase
          .from('app_settings')
          .select('value')
          .eq('key', 'support_link')
          .single();

        if (!error && data?.value) {
          setSupportLink(data.value);
        }
      } catch (e) {
        console.error('Failed to fetch support link:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchSupportLink();
  }, []);

  return { supportLink, loading };
};
