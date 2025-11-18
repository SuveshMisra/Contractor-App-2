import { View, Text } from 'react-native';
import { Link } from 'expo-router';

export default function Home() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-xl font-bold">Contractor App</Text>
      <Link href="/auth/login" className="text-blue-500 mt-4">Go to Login</Link>
    </View>
  );
}

