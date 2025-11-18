import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'expo-router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 p-4">
      <View className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <Text className="text-2xl font-bold mb-6 text-center text-gray-800">Welcome Back</Text>
        
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

