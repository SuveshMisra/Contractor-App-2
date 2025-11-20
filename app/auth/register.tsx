import { View, Text, TouchableOpacity, Alert, Modal, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Link, useRouter } from 'expo-router';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

export default function Register() {
  const [firstName, setFirstName] = useState('');
  const [surname, setSurname] = useState('');
  const [contactDetails, setContactDetails] = useState('');
  const [standNumber, setStandNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    if (!firstName.trim() || !surname.trim()) {
        Alert.alert('Please enter your name and surname');
        return;
    }

    if (password.length < 6) {
        Alert.alert('Password must be at least 6 characters');
        return;
    }

    setLoading(true);
    
    const { data: { session }, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: `${firstName} ${surname}`,
          surname: surname,
          contact_details: contactDetails,
          stand_number: standNumber,
          role: role,
          estate_id: role === 'resident' ? estateId : null,
        },
      },
    });

    if (error) {
        console.error('Signup Error:', error);
        Alert.alert('Signup Failed', error.message);
    } else {
        if (!session) Alert.alert('Please check your inbox for email verification!');
    }
    
    setLoading(false);
  }

  return (
    <ScreenLayout className="justify-center items-center">
      <Card className="w-full max-w-sm">
        <Text className="text-2xl font-bold mb-6 text-center text-slate-800">Create Account</Text>
        
        <View className="flex-row mb-6 bg-slate-100 p-1 rounded-lg">
            <TouchableOpacity 
                className={`flex-1 py-2 px-3 rounded-md ${role === 'resident' ? 'bg-white shadow-sm' : ''}`}
                onPress={() => setRole('resident')}
            >
                <Text className={`text-center font-medium ${role === 'resident' ? 'text-slate-900' : 'text-slate-500'}`}>Resident</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                className={`flex-1 py-2 px-3 rounded-md ${role === 'contractor' ? 'bg-white shadow-sm' : ''}`}
                onPress={() => setRole('contractor')}
            >
                <Text className={`text-center font-medium ${role === 'contractor' ? 'text-slate-900' : 'text-slate-500'}`}>Contractor</Text>
            </TouchableOpacity>
        </View>

        <Input
          label="Name"
          placeholder="Name"
          value={firstName}
          onChangeText={setFirstName}
        />

        <Input
          label="Surname"
          placeholder="Surname"
          value={surname}
          onChangeText={setSurname}
        />

        <Input
          label="Contact Details"
          placeholder="Phone number, etc."
          value={contactDetails}
          onChangeText={setContactDetails}
        />

        {role === 'resident' && (
            <>
                <View className="mb-4">
                    <Text className="text-sm font-medium text-slate-700 mb-1.5">Estate</Text>
                    <TouchableOpacity 
                        onPress={() => setShowEstateModal(true)}
                        className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg flex-row justify-between items-center"
                    >
                        <Text className={estateId ? 'text-slate-900' : 'text-slate-400'}>
                            {estateId ? estates.find(e => e.id === estateId)?.name : 'Select Estate'}
                        </Text>
                        <Text className="text-slate-400">▼</Text>
                    </TouchableOpacity>
                </View>
                <Input
                    label="Stand Number"
                    placeholder="Stand Number"
                    value={standNumber}
                    onChangeText={setStandNumber}
                />
            </>
        )}

        <Input
          label="Email"
          placeholder="email@address.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Input
          label="Password"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        
        <Button 
            title="Sign Up"
            onPress={signUpWithEmail}
            loading={loading}
            className="mt-2"
        />

        <View className="mt-6 flex-row justify-center items-center space-x-1">
            <Text className="text-slate-600">Already have an account?</Text>
            <Link href="/auth/login" asChild>
              <Text className="text-blue-600 font-semibold">Sign In</Text>
            </Link>
        </View>

        <Modal 
            visible={showEstateModal} 
            animationType="fade" 
            transparent={true}
            onRequestClose={() => setShowEstateModal(false)}
        >
            <View className="flex-1 bg-black/50 justify-center items-center p-4">
                <Card className="w-full max-w-sm bg-white max-h-[80%]">
                    <View className="flex-row justify-between items-center mb-4 border-b border-slate-100 pb-4">
                        <Text className="text-lg font-bold text-slate-800">Select Estate</Text>
                        <TouchableOpacity onPress={() => setShowEstateModal(false)} className="p-1">
                            <Text className="text-slate-400 font-bold text-lg">✕</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <FlatList 
                        data={estates}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity 
                                className={`p-4 border-b border-slate-50 ${estateId === item.id ? 'bg-blue-50' : ''}`}
                                onPress={() => { setEstateId(item.id); setShowEstateModal(false); }}
                            >
                                <Text className={`text-base ${estateId === item.id ? 'font-semibold text-blue-700' : 'text-slate-700'}`}>
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={<Text className="text-center text-slate-500 py-4">No estates found.</Text>}
                    />
                    
                    <Button 
                        title="Cancel" 
                        variant="ghost" 
                        onPress={() => setShowEstateModal(false)} 
                        className="mt-4"
                    />
                </Card>
            </View>
        </Modal>
      </Card>
    </ScreenLayout>
  );
}
