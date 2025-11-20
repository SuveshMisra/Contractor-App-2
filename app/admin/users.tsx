import { View, Text, FlatList, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

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
    <ScreenLayout scroll={false}>
      <View className="flex-1">
        <View className="mb-4 mt-2">
           <Text className="text-2xl font-bold text-slate-800">Manage Users</Text>
        </View>

        <FlatList
            data={users}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
            <Card 
                className="mb-3 flex-row justify-between items-center"
                onPress={() => openUserModal(item)}
            >
                <View className="flex-1 mr-4">
                <Text className="font-bold text-slate-900 text-lg">{item.full_name || 'No Name'}</Text>
                <Text className="text-slate-500 capitalize">{item.role}</Text>
                {item.role === 'resident' && item.estate_id && (
                    <Text className="text-slate-400 text-xs mt-1">
                        {estates.find(e => e.id === item.estate_id)?.name || 'Unknown Estate'}
                    </Text>
                )}
                </View>
                
                <Text className="text-blue-600 font-medium">Edit</Text>
            </Card>
            )}
            ListEmptyComponent={<Text className="p-8 text-center text-slate-500">No users found.</Text>}
        />
      </View>

      <Modal 
        visible={!!selectedUser} 
        animationType="fade" 
        transparent={true}
        onRequestClose={() => setSelectedUser(null)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
            <Card className="w-full max-w-lg max-h-[90%] bg-white flex-shrink-0">
                <View className="flex-row justify-between items-center mb-4 border-b border-slate-100 pb-4">
                    <Text className="text-xl font-bold text-slate-800">Edit User</Text>
                    <TouchableOpacity onPress={() => setSelectedUser(null)} className="p-2 rounded-full hover:bg-slate-100">
                        <Text className="text-slate-400 text-xl font-bold">✕</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-shrink-0 mb-4" showsVerticalScrollIndicator={false}>
                    {selectedUser && (
                        <View>
                            <View className="mb-6">
                                <Text className="text-sm text-slate-500 uppercase tracking-wider mb-1">Name</Text>
                                <Text className="text-xl font-semibold text-slate-900">{selectedUser.full_name || 'No Name'}</Text>
                            </View>

                            <View className="mb-6">
                                <Text className="text-sm text-slate-500 uppercase tracking-wider mb-1">Role</Text>
                                <Text className="text-xl capitalize text-slate-900">{selectedUser.role}</Text>
                            </View>

                            {selectedUser.role === 'resident' && (
                                <View className="mb-6">
                                    <Text className="text-lg font-bold mb-3 text-slate-800">Assigned Estate</Text>
                                    {estates.map(estate => (
                                        <TouchableOpacity 
                                            key={estate.id}
                                            className={`p-3 mb-2 rounded-lg flex-row justify-between items-center border ${selectedUser.estate_id === estate.id ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'}`}
                                            onPress={() => updateResidentEstate(estate.id)}
                                        >
                                            <Text className={selectedUser.estate_id === estate.id ? 'font-semibold text-blue-700' : 'text-slate-700'}>
                                                {estate.name}
                                            </Text>
                                            {selectedUser.estate_id === estate.id && <Text className="text-blue-600 font-bold">✓</Text>}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            {selectedUser.role === 'contractor' && (
                                <View className="mb-6">
                                    <Text className="text-lg font-bold mb-1 text-slate-800">Assigned Estates</Text>
                                    <Text className="text-slate-500 mb-3 text-sm">Tap to toggle access</Text>
                                    {estates.map(estate => {
                                        const isAssigned = userContractorEstates.includes(estate.id);
                                        return (
                                            <TouchableOpacity 
                                                key={estate.id}
                                                className={`p-3 mb-2 rounded-lg flex-row justify-between items-center border ${isAssigned ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'}`}
                                                onPress={() => toggleContractorEstate(estate.id)}
                                            >
                                                <Text className={isAssigned ? 'font-semibold text-blue-700' : 'text-slate-700'}>
                                                    {estate.name}
                                                </Text>
                                                {isAssigned && <Text className="text-blue-600 font-bold">✓</Text>}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}

                            <View className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                                {selectedUser.role !== 'admin' && (
                                    <Button 
                                        title="Promote to Admin"
                                        onPress={() => promoteToAdmin(selectedUser.id)}
                                    />
                                )}
                                
                                <Button 
                                    title="Delete User"
                                    variant="danger"
                                    onPress={() => deleteUser(selectedUser.id)}
                                />
                            </View>
                        </View>
                    )}
                </ScrollView>
            </Card>
        </View>
      </Modal>
    </ScreenLayout>
  );
}
