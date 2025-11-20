import { View, Text, FlatList, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';

type Estate = Database['public']['Tables']['estates']['Row'];

export default function ManageEstates() {
  const [estates, setEstates] = useState<Estate[]>([]);
  const [newEstateName, setNewEstateName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchEstates();
  }, []);

  async function fetchEstates() {
    const { data } = await supabase.from('estates').select('*').order('name');
    if (data) setEstates(data);
  }

  async function addEstate() {
    if (!newEstateName.trim()) return;
    setLoading(true);
    const { error } = await supabase.from('estates').insert({ name: newEstateName.trim() });
    if (error) {
        Alert.alert('Error', error.message);
    } else {
        setNewEstateName('');
        fetchEstates();
    }
    setLoading(false);
  }

  return (
    <ScreenLayout>
      <View className="mb-6">
          <Text className="text-2xl font-bold text-slate-800">Manage Estates</Text>
          <Text className="text-slate-500">Add and view estates in the system.</Text>
      </View>

      <Card className="mb-8">
          <Text className="font-semibold text-slate-700 mb-4">Add New Estate</Text>
          <View className="flex-col sm:flex-row gap-3">
              <View className="flex-1">
                <Input 
                    containerClassName="mb-0"
                    placeholder="Enter estate name..."
                    value={newEstateName}
                    onChangeText={setNewEstateName}
                />
              </View>
              <Button 
                title="Add Estate" 
                onPress={addEstate} 
                loading={loading}
                className="sm:w-auto"
              />
          </View>
      </Card>

      <Text className="text-lg font-semibold text-slate-800 mb-3">Existing Estates</Text>
      <FlatList
        data={estates}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <Card className="mb-3 p-4 flex-row justify-between items-center" variant="flat">
            <Text className="font-medium text-slate-900 text-lg">{item.name}</Text>
          </Card>
        )}
        ListEmptyComponent={<Text className="text-center text-slate-500 py-8 bg-slate-50 rounded-lg border border-slate-100 border-dashed">No estates found.</Text>}
      />
    </ScreenLayout>
  );
}
