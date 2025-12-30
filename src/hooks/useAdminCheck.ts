import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const checkAdminStatus = async () => {
      // Wait for auth to finish loading
      if (authLoading) {
        return;
      }

      if (!user) {
        console.log('useAdminCheck: No user logged in');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      console.log('useAdminCheck: Checking admin status for user:', user.id);

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('useAdminCheck: Error checking admin status:', error);
        setIsAdmin(false);
      } else {
        console.log('useAdminCheck: Admin check result:', data);
        setIsAdmin(!!data);
      }
      setLoading(false);
    };

    checkAdminStatus();
  }, [user, authLoading]);

  return { isAdmin, loading: loading || authLoading };
};
