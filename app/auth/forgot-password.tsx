import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'expo-router';

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
    <View className="flex-1 justify-center items-center bg-gray-100 p-4">
      <View className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <Text className="text-2xl font-bold mb-6 text-center text-gray-800">Reset Password</Text>
        
        {errorMessage ? (
          <View className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <Text className="text-red-700">{errorMessage}</Text>
          </View>
        ) : null}

        {successMessage ? (
          <View className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            <Text className="text-green-700">{successMessage}</Text>
          </View>
        ) : null}

        <Text className="text-gray-600 mb-4 text-center">
            Enter your email address and we'll send you a link to reset your password.
        </Text>

        <TextInput
          className="border border-gray-300 rounded-md p-3 mb-6 bg-white"
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
          keyboardType="email-address"
        />
        
        <TouchableOpacity 
            className={`bg-blue-600 rounded-md p-3 ${loading ? 'opacity-50' : ''}`}
            disabled={loading} 
            onPress={resetPassword}
        >
          <Text className="text-white text-center font-semibold text-lg">Send Reset Link</Text>
        </TouchableOpacity>

        <View className="mt-4 flex-row justify-center">
            <Link href="/auth/login" className="text-blue-600 font-semibold">Back to Sign In</Link>
        </View>
      </View>
    </View>
  );
}

