import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenLayout } from '../components/ScreenLayout';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

export default function Home() {
  const router = useRouter();

  return (
    <ScreenLayout className="justify-center items-center">
      <Card className="w-full max-w-sm items-center p-8 space-y-6">
        <View className="items-center mb-6">
          <Text className="text-3xl font-bold text-slate-900 mb-2">Contractor App</Text>
          <Text className="text-slate-500 text-center">
            Manage your estate work efficiently and professionally.
          </Text>
        </View>
        
        <Button 
          title="Go to Login" 
          onPress={() => router.push('/auth/login')}
          className="w-full"
        />
      </Card>
    </ScreenLayout>
  );
}
