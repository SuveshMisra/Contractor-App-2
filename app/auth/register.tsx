import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Modal, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link, useRouter } from 'expo-router';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'resident' | 'contractor'>('resident');
  const [loading, setLoading] = useState(false);
  const [estates, setEstates] = useState<{id: string, name: string}[]>([]);
  const [estateId, setEstateId] = useState<string | null>(null);
  const [showEstateModal, setShowEstateModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    supabase.from('estates').select('id, name').then(({ data }) => {
      if (data) setEstates(data);
    });
  }, []);

  async function signUpWithEmail() {
    if (role === 'resident' && !estateId) {
        Alert.alert('Please select an estate');
        return;
    }

    if (!fullName.trim()) {
        Alert.alert('Please enter your full name');
        return;
    }

    if (password.length < 6) {
        Alert.alert('Password must be at least 6 characters');
        return;
    }

    setLoading(true);
    console.log('Signing up with:', { email, role, fullName, estateId: role === 'resident' ? estateId : null });
    
    const { data: { session }, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
          estate_id: role === 'resident' ? estateId : null,
        },
      },
    });

    if (error) {
        console.error('Signup Error Details:', {
            message: error.message,
            name: error.name,
            status: error.status,
            stack: error.stack
        });
        Alert.alert('Signup Failed', `Error: ${error.message}\nPlease check console for details.`);
    } else {
        if (!session) Alert.alert('Please check your inbox for email verification!');
    }
    
    setLoading(false);
  }

  return (
    <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}} className="bg-gray-100 p-4">
      <View className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm mx-auto">
        <Text className="text-2xl font-bold mb-6 text-center text-gray-800">Create Account</Text>
        
        <View className="flex-row mb-4 bg-gray-200 rounded-md p-1">
            <TouchableOpacity 
                className={`flex-1 p-2 rounded-sm ${role === 'resident' ? 'bg-white shadow-sm' : ''}`}
                onPress={() => setRole('resident')}
            >
                <Text className={`text-center font-semibold ${role === 'resident' ? 'text-blue-600' : 'text-gray-500'}`}>Resident</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                className={`flex-1 p-2 rounded-sm ${role === 'contractor' ? 'bg-white shadow-sm' : ''}`}
                onPress={() => setRole('contractor')}
            >
                <Text className={`text-center font-semibold ${role === 'contractor' ? 'text-blue-600' : 'text-gray-500'}`}>Contractor</Text>
            </TouchableOpacity>
        </View>

        <TextInput
          className="border border-gray-300 rounded-md p-3 mb-4 bg-white"
          onChangeText={(text) => setFullName(text)}
          value={fullName}
          placeholder="Full Name"
        />

        {role === 'resident' && (
            <TouchableOpacity 
                onPress={() => setShowEstateModal(true)}
                className="border border-gray-300 rounded-md p-3 mb-4 bg-white flex-row justify-between"
            >
                <Text className={estateId ? 'text-black' : 'text-gray-400'}>
                    {estateId ? estates.find(e => e.id === estateId)?.name : 'Select Estate'}
                </Text>
                <Text>▼</Text>
            </TouchableOpacity>
        )}

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
            onPress={signUpWithEmail}
        >
          <Text className="text-white text-center font-semibold text-lg">Sign Up</Text>
        </TouchableOpacity>

        <View className="mt-4 flex-row justify-center">
            <Text className="text-gray-600">Already have an account? </Text>
            <Link href="/auth/login" className="text-blue-600 font-semibold">Sign In</Link>
        </View>

        <Modal visible={showEstateModal} animationType="slide">
            <View className="flex-1 p-4 mt-10 bg-white">
                <Text className="text-xl font-bold mb-4">Select Your Estate</Text>
                <FlatList 
                    data={estates}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            className="p-4 border-b border-gray-100"
                            onPress={() => { setEstateId(item.id); setShowEstateModal(false); }}
                        >
                            <Text className="text-lg">{item.name}</Text>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text className="text-center text-gray-500 mt-4">No estates found. Ask admin to create one.</Text>}
                />
                <TouchableOpacity onPress={() => setShowEstateModal(false)} className="p-4 bg-gray-200 rounded-md mt-4">
                    <Text className="text-center font-semibold">Cancel</Text>
                </TouchableOpacity>
            </View>
        </Modal>
      </View>
    </ScrollView>
  );
}

