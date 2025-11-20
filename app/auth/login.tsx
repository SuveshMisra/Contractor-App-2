import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'expo-router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function signInWithEmail() {
    setLoading(true);
    setErrorMessage('');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      // Also log for debugging purposes
      console.error('Login error:', error); 
    }
    setLoading(false);
  }

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 p-4">
      <View className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <Text className="text-2xl font-bold mb-6 text-center text-gray-800">Welcome Back</Text>
        
        {errorMessage ? (
          <View className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <Text className="text-red-700">{errorMessage}</Text>
          </View>
        ) : null}

        <TextInput
          className="border border-gray-300 rounded-md p-3 mb-4 bg-white"
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize={'none'}
        />
        <TextInput
          className="border border-gray-300 rounded-md p-3 mb-6 bg-white"
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize={'none'}
        />

        <View className="flex-row justify-end mb-6">
          <Link href="/auth/forgot-password" className="text-blue-600 font-semibold">
            Forgot Password?
          </Link>
        </View>
        
        <TouchableOpacity 
            className={`bg-blue-600 rounded-md p-3 ${loading ? 'opacity-50' : ''}`}
            disabled={loading} 
            onPress={signInWithEmail}
        >
          <Text className="text-white text-center font-semibold text-lg">Sign In</Text>
        </TouchableOpacity>

        <View className="mt-4 flex-row justify-center">
            <Text className="text-gray-600">Don't have an account? </Text>
            <Link href="/auth/register" className="text-blue-600 font-semibold">Sign Up</Link>
        </View>
      </View>
    </View>
  );
}

