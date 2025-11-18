import { View, Text, FlatList, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database';

type Estate = Database['public']['Tables']['estates']['Row'];

export default function ManageEstates() {
  const [estates, setEstates] = useState<Estate[]>([]);
  const [newEstateName, setNewEstateName] = useState('');

  useEffect(() => {
    fetchEstates();
  }, []);

  async function fetchEstates() {
    const { data } = await supabase.from('estates').select('*');
    if (data) setEstates(data);
  }

  async function addEstate() {
    if (!newEstateName) return;
    const { error } = await supabase.from('estates').insert({ name: newEstateName });
    if (error) Alert.alert(error.message);
    else {
        setNewEstateName('');
        fetchEstates();
    }
  }

  return (
    <View className="flex-1 bg-white p-4">
      <View className="flex-row mb-4">
          <TextInput 
            className="flex-1 border border-gray-300 rounded-l-md p-2"
            placeholder="New Estate Name"
            value={newEstateName}
            onChangeText={setNewEstateName}
          />
          <TouchableOpacity onPress={addEstate} className="bg-green-600 p-2 rounded-r-md justify-center">
              <Text className="text-white font-bold">Add</Text>
          </TouchableOpacity>
      </View>

      <FlatList
        data={estates}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="p-4 border-b border-gray-200">
            <Text className="font-bold">{item.name}</Text>
          </View>
        )}
        ListEmptyComponent={<Text className="text-center text-gray-500">No estates found.</Text>}
      />
    </View>
  );
}

