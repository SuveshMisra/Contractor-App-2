import { View, Text } from 'react-native';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'expo-router';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function resetPassword() {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    
    if (!email) {
        setErrorMessage('Please enter your email address');
        setLoading(false);
        return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      setErrorMessage(error.message);
    } else {
      setSuccessMessage('Password reset instructions have been sent to your email.');
    }
    setLoading(false);
  }

  return (
    <ScreenLayout className="justify-center items-center">
      <Card className="w-full max-w-sm">
        <Text className="text-2xl font-bold mb-6 text-center text-slate-800">Reset Password</Text>
        
        {errorMessage ? (
          <View className="bg-red-50 border border-red-200 px-4 py-3 rounded-lg mb-6">
            <Text className="text-red-700 text-sm">{errorMessage}</Text>
          </View>
        ) : null}

        {successMessage ? (
          <View className="bg-green-50 border border-green-200 px-4 py-3 rounded-lg mb-6">
            <Text className="text-green-700 text-sm">{successMessage}</Text>
          </View>
        ) : null}

        <Text className="text-slate-600 mb-6 text-center">
            Enter your email address and we'll send you a link to reset your password.
        </Text>

        <Input
          placeholder="email@address.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <Button 
            title="Send Reset Link"
            onPress={resetPassword}
            loading={loading}
            className="mb-4"
        />

        <View className="flex-row justify-center">
            <Link href="/auth/login" asChild>
              <Text className="text-blue-600 font-semibold">Back to Sign In</Text>
            </Link>
        </View>
      </Card>
    </ScreenLayout>
  );
}
