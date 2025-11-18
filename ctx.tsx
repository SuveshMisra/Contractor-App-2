import React from 'react';
import { useSegments, useRouter } from 'expo-router';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';

const AuthContext = React.createContext<{
  session: Session | null;
  isLoading: boolean;
  signOut: () => void;
}>({
  session: null,
  isLoading: true,
  signOut: () => {},
});

export function useAuth() {
  return React.useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
      await supabase.auth.signOut();
      router.replace('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

