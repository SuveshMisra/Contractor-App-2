import { Slot, useRouter, useSegments } from 'expo-router';
import "../global.css";
import { AuthProvider, useAuth } from '../ctx';
import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';

function RootLayoutNav() {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!session && !inAuthGroup) {
      router.replace('/auth/login');
    } else if (session && inAuthGroup) {
      const role = session.user.user_metadata?.role;
      if (role === 'admin') {
        router.replace('/admin');
      } else if (role === 'contractor') {
        router.replace('/(contractor)');
      } else {
        router.replace('/(resident)');
      }
    }
  }, [session, segments, isLoading]);

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
