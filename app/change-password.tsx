import { View, Text, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import { ScreenLayout } from '../components/ScreenLayout';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('Session check:', session ? 'Active' : 'None');
        if (!session) {
            setErrorMessage('No active session. Please sign in again.');
        }
    });
  }, []);

  async function handleChangePassword() {
    console.log('Attempting password update...');
    setErrorMessage('');

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      console.log('Update result:', { data, error });

      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
      } else {
        setIsSuccess(true);
        setLoading(false);
      }
    } catch (err) {
        console.error('Unexpected error:', err);
        setErrorMessage('An unexpected error occurred.');
        setLoading(false);
    }
  }

  if (isSuccess) {
      return (
        <ScreenLayout className="justify-center items-center">
            <Card className="w-full max-w-sm items-center">
                <Text className="text-2xl font-bold mb-4 text-green-600">Success!</Text>
                <Text className="text-slate-600 text-center mb-6">Your password has been updated successfully.</Text>
                <Button 
                    title="Go to Dashboard"
                    onPress={() => router.replace('/')}
                    className="w-full"
                />
            </Card>
        </ScreenLayout>
      );
  }

  return (
    <ScreenLayout className="justify-center items-center">
      <Card className="w-full max-w-sm">
        <Text className="text-2xl font-bold mb-6 text-center text-slate-800">Change Password</Text>
        
        {errorMessage ? (
          <View className="bg-red-50 border border-red-200 px-4 py-3 rounded-lg mb-6">
            <Text className="text-red-700 text-sm">{errorMessage}</Text>
          </View>
        ) : null}

        <Input
          placeholder="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        
        <Input
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        
        <Button 
            title="Update Password"
            onPress={handleChangePassword}
            loading={loading}
            className="mt-2"
        />

        <Button 
            title="Cancel"
            variant="ghost"
            onPress={() => router.replace('/')}
            disabled={loading}
            className="mt-4"
        />
      </Card>
    </ScreenLayout>
  );
}
