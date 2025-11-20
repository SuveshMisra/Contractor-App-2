import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

export default function ManageUsers() {
  const [users, setUsers] = useState<Profile[]>([]);

  async function fetchUsers() {
    const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
    if (data) setUsers(data);
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const promoteToAdmin = async (userId: string) => {
    Alert.alert(
      "Promote to Admin",
      "Are you sure you want to promote this user to Admin?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Promote", 
          onPress: async () => {
            const { error } = await supabase
              .from('profiles')
              .update({ role: 'admin' })
              .eq('id', userId);
            
            if (error) {
              Alert.alert("Error", error.message);
            } else {
              Alert.alert("Success", "User promoted. They will see admin access on their next login.");
              fetchUsers();
            }
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
            <View>
              <Text className="font-bold">{item.full_name || 'No Name'}</Text>
              <Text className="text-gray-500 capitalize">{item.role}</Text>
            </View>
            
            {item.role !== 'admin' && (
              <TouchableOpacity 
                className="bg-blue-600 px-4 py-2 rounded-md"
                onPress={() => promoteToAdmin(item.id)}
              >
                <Text className="text-white font-semibold">Promote</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={<Text className="p-4 text-center text-gray-500">No users found.</Text>}
      />
    </View>
  );
}
