import { Stack } from 'expo-router';

export default function ResidentLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Home' }} />
      <Stack.Screen name="contractor/[id]" options={{ title: 'Contractor Details' }} />
      <Stack.Screen name="review/[id]" options={{ title: 'Write Review' }} />
      <Stack.Screen name="profile" options={{ title: 'My Profile' }} />
    </Stack>
  );
}

