import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../ctx';
import { Link } from 'expo-router';

type Contractor = {
  id: string;
  full_name: string;
  role: string;
};

export default function ResidentHome() {
  const { session, signOut } = useAuth();
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [estateName, setEstateName] = useState<string>('');

  useEffect(() => {
    if (!session) return;

    async function loadData() {
      try {
        // 1. Get Resident's Estate
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('estate_id')
          .eq('id', session?.user.id)
          .single();

        if (profileError) throw profileError;
        if (!profile?.estate_id) {
          // Handle case where resident has no estate
          setLoading(false);
          return;
        }

        // 2. Get Estate Name
        const { data: estate } = await supabase
          .from('estates')
          .select('name')
          .eq('id', profile.estate_id)
          .single();
        
        if (estate) setEstateName(estate.name);

        // 3. Get Contractors for this Estate
        const { data: links, error: linkError } = await supabase
          .from('contractor_estates')
          .select('contractor_id')
          .eq('estate_id', profile.estate_id);

        if (linkError) throw linkError;

        if (links && links.length > 0) {
          const contractorIds = links.map(l => l.contractor_id);
          const { data: contractorsData, error: contractorsError } = await supabase
            .from('profiles')
            .select('id, full_name, role')
            .in('id', contractorIds)
            .eq('role', 'contractor');
          
          if (contractorsError) throw contractorsError;
          setContractors(contractorsData || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [session]);

  if (loading) {
    return <View className="flex-1 justify-center items-center"><ActivityIndicator /></View>;
  }

  return (
    <View className="flex-1 p-4 bg-gray-50">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-2xl font-bold text-gray-800">Contractors</Text>
        <TouchableOpacity onPress={signOut} className="bg-gray-200 p-2 rounded-md">
            <Text className="text-xs">Sign Out</Text>
        </TouchableOpacity>
      </View>
      
      {estateName ? <Text className="mb-4 text-gray-600">Estate: {estateName}</Text> : null}

      <FlatList
        data={contractors}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Link href={`/(resident)/contractor/${item.id}`} asChild>
            <TouchableOpacity className="bg-white p-4 rounded-lg mb-3 shadow-sm flex-row justify-between items-center">
              <View>
                <Text className="text-lg font-semibold">{item.full_name}</Text>
                <Text className="text-gray-500 capitalize">{item.role}</Text>
              </View>
              <Text className="text-blue-500">View</Text>
            </TouchableOpacity>
          </Link>
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-10">No contractors found for your estate.</Text>
        }
      />
    </View>
  );
}

