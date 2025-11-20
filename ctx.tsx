import React from 'react';
import { useSegments, useRouter } from 'expo-router';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { Database } from './types/database';

type UserRole = Database['public']['Tables']['profiles']['Row']['role'];

const AuthContext = React.createContext<{
  session: Session | null;
  isLoading: boolean;
  signOut: () => void;
  role: UserRole | null;
}>({
  session: null,
  isLoading: true,
  signOut: () => {},
  role: null,
});

export function useAuth() {
  return React.useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [role, setRole] = React.useState<UserRole | null>(null);
  const segments = useSegments();
  const router = useRouter();

  React.useEffect(() => {
    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
          const { data } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
          if (data) {
              setRole(data.role);
          }
      }
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
          // Refresh role on auth changes
          const { data } = await supabase
              .from('profiles')
              .select('role')
              .eq('id', session.user.id)
              .single();
          if (data) {
              setRole(data.role);
          }
      } else {
          setRole(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
      await supabase.auth.signOut();
      setRole(null);
      router.replace('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ session, isLoading, signOut, role }}>
      {children}
    </AuthContext.Provider>
  );
}
