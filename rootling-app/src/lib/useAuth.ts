import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { supabase } from './supabase';

export interface AuthState {
  ready: boolean;
  session: Session | null;
  /** The parent opened a reset-password link and should choose a new password. */
  recovery: boolean;
}

export function useAuth(): AuthState & { clearRecovery: () => void } {
  const [state, setState] = useState<AuthState>({
    ready: !supabase,
    session: null,
    recovery: typeof window !== 'undefined' && window.location.pathname === '/reset-password',
  });

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setState((s) => ({ ...s, ready: true, session: data.session })));
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      setState((s) => ({ ready: true, session, recovery: s.recovery || event === 'PASSWORD_RECOVERY' }));
    });
    return () => data.subscription.unsubscribe();
  }, []);

  return { ...state, clearRecovery: () => setState((s) => ({ ...s, recovery: false })) };
}

export function useOnline(): boolean {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);
  return online;
}
