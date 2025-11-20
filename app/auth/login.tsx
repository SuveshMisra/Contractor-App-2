import { View, Text } from 'react-native';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link, useRouter } from 'expo-router';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  async function signInWithEmail() {
    setLoading(true);
    setErrorMessage('');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      console.error('Login error:', error); 
    }
    setLoading(false);
  }

  return (
    <ScreenLayout className="justify-center items-center">
      <Card className="w-full max-w-sm">
        <Text className="text-2xl font-bold mb-6 text-center text-slate-800">Welcome Back</Text>
        
        {errorMessage ? (
          <View className="bg-red-50 border border-red-200 px-4 py-3 rounded-lg mb-6">
            <Text className="text-red-700 text-sm">{errorMessage}</Text>
          </View>
        ) : null}

        <Input
          label="Email Address"
          placeholder="email@address.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <View className="flex-row justify-end mb-6">
          <Link href="/auth/forgot-password" asChild>
            <Text className="text-blue-600 font-semibold text-sm">Forgot Password?</Text>
          </Link>
        </View>
        
        <Button 
          title="Sign In"
          onPress={signInWithEmail}
          loading={loading}
        />

        <View className="mt-6 flex-row justify-center items-center space-x-1">
            <Text className="text-slate-600">Don't have an account?</Text>
            <Link href="/auth/register" asChild>
              <Text className="text-blue-600 font-semibold">Sign Up</Text>
            </Link>
        </View>
      </Card>
    </ScreenLayout>
  );
}
