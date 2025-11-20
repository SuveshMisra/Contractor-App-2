import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../ctx';
import { Link } from 'expo-router';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

type Contractor = {
  id: string;
  full_name: string;
  role: string;
};

export default function ResidentHome() {
  const { session } = useAuth();
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
    return <View className="flex-1 justify-center items-center bg-slate-50"><ActivityIndicator color="#2563eb" /></View>;
  }

  return (
    <ScreenLayout>
      <View className="flex-row justify-between items-start mb-6">
        <View>
            <Text className="text-3xl font-bold text-slate-900">Contractors</Text>
            {estateName ? <Text className="text-slate-500 mt-1">Estate: <Text className="font-semibold text-slate-700">{estateName}</Text></Text> : null}
        </View>
        <Link href="/(resident)/profile" asChild>
            <Button title="My Profile" variant="outline" className="px-3 h-10" />
        </Link>
      </View>
      
      <FlatList
        data={contractors}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <Link href={`/(resident)/contractor/${item.id}`} asChild>
            <TouchableOpacity>
                <Card className="mb-3 p-4 flex-row justify-between items-center active:bg-slate-50">
                    <View>
                        <Text className="text-lg font-semibold text-slate-900">{item.full_name}</Text>
                        <Text className="text-slate-500 capitalize text-sm">{item.role}</Text>
                    </View>
                    <Text className="text-blue-600 font-medium">View Profile ›</Text>
                </Card>
            </TouchableOpacity>
          </Link>
        )}
        ListEmptyComponent={
          <Text className="text-center text-slate-500 py-10 bg-slate-50 rounded-lg border border-slate-100 border-dashed">No contractors found for your estate.</Text>
        }
      />
    </ScreenLayout>
  );
}
