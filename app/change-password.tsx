import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';

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
        <View className="flex-1 justify-center items-center bg-gray-100 p-4">
            <View className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm items-center">
                <Text className="text-2xl font-bold mb-4 text-green-600">Success!</Text>
                <Text className="text-gray-600 text-center mb-6">Your password has been updated successfully.</Text>
                <TouchableOpacity 
                    className="bg-blue-600 rounded-md p-3 w-full"
                    onPress={() => router.replace('/')}
                >
                    <Text className="text-white text-center font-semibold text-lg">Go to Dashboard</Text>
                </TouchableOpacity>
            </View>
        </View>
      );
  }

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 p-4">
      <View className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <Text className="text-2xl font-bold mb-6 text-center text-gray-800">Change Password</Text>
        
        {errorMessage ? (
          <View className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <Text className="text-red-700">{errorMessage}</Text>
          </View>
        ) : null}

        <TextInput
          className="border border-gray-300 rounded-md p-3 mb-4 bg-white"
          onChangeText={setNewPassword}
          value={newPassword}
          secureTextEntry={true}
          placeholder="New Password"
          autoCapitalize="none"
        />
        
        <TextInput
          className="border border-gray-300 rounded-md p-3 mb-6 bg-white"
          onChangeText={setConfirmPassword}
          value={confirmPassword}
          secureTextEntry={true}
          placeholder="Confirm New Password"
          autoCapitalize="none"
        />
        
        <TouchableOpacity 
            className={`bg-blue-600 rounded-md p-3 ${loading ? 'opacity-50' : ''}`}
            disabled={loading} 
            onPress={handleChangePassword}
        >
          {loading ? (
             <ActivityIndicator color="white" />
          ) : (
             <Text className="text-white text-center font-semibold text-lg">Update Password</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
            className="mt-4 p-3"
            onPress={() => router.back()}
            disabled={loading}
        >
          <Text className="text-gray-600 text-center">Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
