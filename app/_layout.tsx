import { Slot, useRouter, useSegments } from 'expo-router';
import "../global.css";
import { AuthProvider, useAuth } from '../ctx';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

function RootLayoutNav() {
  const { session, isLoading, role } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!session && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (session && role) {
      // Redirect logic based on role from database
      const isAtAdmin = segments[0] === 'admin';
      const isAtContractor = segments[0] === '(contractor)';
      const isAtResident = segments[0] === '(resident)';

      if (role === 'admin') {
        if (!isAtAdmin) router.replace('/admin');
      } else if (role === 'contractor') {
        if (!isAtContractor) router.replace('/(contractor)');
      } else if (role === 'resident') {
        if (!isAtResident) router.replace('/(resident)');
      }
    }
  }, [session, role, segments, isLoading]);

  if (isLoading) {
      return (
          <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" />
          </View>
      )
  }

  return <Slot />;
}

export default function Layout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
