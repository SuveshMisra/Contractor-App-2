import { View, Text, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function ManageUsers() {
  const [users, setUsers] = useState<Profile[]>([]);

  useEffect(() => {
    // Fetch users. 
    // Note: This requires RLS policies allowing admin to read all profiles.
    async function fetchUsers() {
      const { data } = await supabase.from('profiles').select('*');
      if (data) setUsers(data);
    }
    fetchUsers();
  }, []);

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="p-4 border-b border-gray-200">
            <Text className="font-bold">{item.full_name || 'No Name'}</Text>
            <Text className="text-gray-500">{item.role}</Text>
          </View>
        )}
        ListEmptyComponent={<Text className="p-4 text-center text-gray-500">No users found.</Text>}
      />
    </View>
  );
}

