import { View, Text, FlatList, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Estate = Database['public']['Tables']['estates']['Row'];

export default function ManageUsers() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [estates, setEstates] = useState<Estate[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [userContractorEstates, setUserContractorEstates] = useState<string[]>([]);

  async function fetchUsers() {
    const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
    if (data) setUsers(data);
  }

  async function fetchEstates() {
    const { data } = await supabase.from('estates').select('*');
    if (data) setEstates(data);
  }

  useEffect(() => {
    fetchUsers();
    fetchEstates();
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
              if (selectedUser && selectedUser.id === userId) {
                  setSelectedUser({ ...selectedUser, role: 'admin' });
              }
            }
          }
        }
      ]
    );
  };

  const deleteUser = async (userId: string) => {
    Alert.alert(
        "Delete User",
        "Are you sure? This will remove their profile. Note: This does not remove their login credentials from Auth, but removes their access.",
        [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: async () => {
                const { error } = await supabase.from('profiles').delete().eq('id', userId);
                if (error) Alert.alert("Error", error.message);
                else {
                    Alert.alert("Success", "User deleted");
                    fetchUsers();
                    if (selectedUser?.id === userId) setSelectedUser(null);
                }
            }}
        ]
    );
  };

  const openUserModal = async (user: Profile) => {
    setSelectedUser(user);
    if (user.role === 'contractor') {
        const { data } = await supabase
            .from('contractor_estates')
            .select('estate_id')
            .eq('contractor_id', user.id);
        if (data) setUserContractorEstates(data.map(d => d.estate_id));
        else setUserContractorEstates([]);
    }
  };

  const updateResidentEstate = async (estateId: string) => {
    if (!selectedUser) return;
    const { error } = await supabase
        .from('profiles')
        .update({ estate_id: estateId })
        .eq('id', selectedUser.id);
    
    if (error) Alert.alert("Error", error.message);
    else {
        setUsers(users.map(u => u.id === selectedUser.id ? { ...u, estate_id: estateId } : u));
        setSelectedUser({ ...selectedUser, estate_id: estateId });
    }
  };

  const toggleContractorEstate = async (estateId: string) => {
    if (!selectedUser) return;
    const isAssigned = userContractorEstates.includes(estateId);
    
    if (isAssigned) {
        const { error } = await supabase
            .from('contractor_estates')
            .delete()
            .eq('contractor_id', selectedUser.id)
            .eq('estate_id', estateId);
        if (error) Alert.alert("Error", error.message);
        else setUserContractorEstates(prev => prev.filter(id => id !== estateId));
    } else {
        const { error } = await supabase
            .from('contractor_estates')
            .insert({ contractor_id: selectedUser.id, estate_id: estateId });
        if (error) Alert.alert("Error", error.message);
        else setUserContractorEstates(prev => [...prev, estateId]);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            className="p-4 border-b border-gray-200 flex-row justify-between items-center"
            onPress={() => openUserModal(item)}
          >
            <View>
              <Text className="font-bold">{item.full_name || 'No Name'}</Text>
              <Text className="text-gray-500 capitalize">{item.role}</Text>
              {item.role === 'resident' && item.estate_id && (
                  <Text className="text-gray-400 text-xs">
                      {estates.find(e => e.id === item.estate_id)?.name || 'Unknown Estate'}
                  </Text>
              )}
            </View>
            
            <Text className="text-blue-500">Edit</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text className="p-4 text-center text-gray-500">No users found.</Text>}
      />

      <Modal visible={!!selectedUser} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-white p-4 mt-4">
            <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-bold">Edit User</Text>
                <TouchableOpacity onPress={() => setSelectedUser(null)} className="p-2">
                    <Text className="text-blue-600 font-bold text-lg">Done</Text>
                </TouchableOpacity>
            </View>

            {selectedUser && (
                <ScrollView>
                    <View className="mb-6">
                        <Text className="text-gray-500 mb-1">Name</Text>
                        <Text className="text-xl font-semibold">{selectedUser.full_name || 'No Name'}</Text>
                    </View>

                    <View className="mb-6">
                        <Text className="text-gray-500 mb-1">Role</Text>
                        <Text className="text-xl capitalize">{selectedUser.role}</Text>
                    </View>

                    {selectedUser.role === 'resident' && (
                        <View className="mb-6">
                            <Text className="text-lg font-bold mb-2">Assigned Estate</Text>
                            {estates.map(estate => (
                                <TouchableOpacity 
                                    key={estate.id}
                                    className={`p-3 mb-2 rounded-md flex-row justify-between items-center ${selectedUser.estate_id === estate.id ? 'bg-blue-100 border border-blue-300' : 'bg-gray-50'}`}
                                    onPress={() => updateResidentEstate(estate.id)}
                                >
                                    <Text className={selectedUser.estate_id === estate.id ? 'font-bold text-blue-800' : 'text-gray-800'}>
                                        {estate.name}
                                    </Text>
                                    {selectedUser.estate_id === estate.id && <Text className="text-blue-600">✓</Text>}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {selectedUser.role === 'contractor' && (
                        <View className="mb-6">
                            <Text className="text-lg font-bold mb-2">Assigned Estates</Text>
                            <Text className="text-gray-500 mb-2 text-sm">Tap to toggle access</Text>
                            {estates.map(estate => {
                                const isAssigned = userContractorEstates.includes(estate.id);
                                return (
                                    <TouchableOpacity 
                                        key={estate.id}
                                        className={`p-3 mb-2 rounded-md flex-row justify-between items-center ${isAssigned ? 'bg-blue-100 border border-blue-300' : 'bg-gray-50'}`}
                                        onPress={() => toggleContractorEstate(estate.id)}
                                    >
                                        <Text className={isAssigned ? 'font-bold text-blue-800' : 'text-gray-800'}>
                                            {estate.name}
                                        </Text>
                                        {isAssigned && <Text className="text-blue-600">✓</Text>}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}

                    <View className="mt-4 border-t border-gray-200 pt-4">
                        {selectedUser.role !== 'admin' && (
                            <TouchableOpacity 
                                className="bg-blue-600 p-3 rounded-md mb-3"
                                onPress={() => promoteToAdmin(selectedUser.id)}
                            >
                                <Text className="text-white text-center font-bold">Promote to Admin</Text>
                            </TouchableOpacity>
                        )}
                        
                        <TouchableOpacity 
                            className="bg-red-100 p-3 rounded-md border border-red-200"
                            onPress={() => deleteUser(selectedUser.id)}
                        >
                            <Text className="text-red-600 text-center font-bold">Delete User</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}
        </View>
      </Modal>
    </View>
  );
}