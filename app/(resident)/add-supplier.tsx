import { View, Text, TouchableOpacity, Alert, Modal, FlatList, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Database } from '../../types/database';

type Category = Database['public']['Tables']['categories']['Row'];

export default function AddSupplier() {
    const { requestId, requestQuery } = useLocalSearchParams<{ requestId: string, requestQuery: string }>();
    const router = useRouter();
    
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [contactDetails, setContactDetails] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        const { data } = await supabase.from('categories').select('*').order('name');
        setCategories(data || []);
    }

    async function handleSubmit() {
        if (!name.trim() || !categoryId) {
            Alert.alert('Error', 'Name and Category are required');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.from('suppliers').insert({
                name,
                category_id: categoryId,
                contact_details: contactDetails,
                status: 'pending'
            });

            if (error) throw error;

            Alert.alert('Success', 'Provider submitted for approval. Thank you!', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message);
        } finally {
            setLoading(false);
        }
    }

    function getCategoryName(id: string | null) {
        if (!id) return '';
        return categories.find(c => c.id === id)?.name || '';
    }

    return (
        <ScreenLayout>
            <ScrollView>
                <Text className="text-2xl font-bold text-slate-900 mb-2">Suggest Provider</Text>
                {requestQuery && (
                    <Text className="text-slate-500 mb-6">
                        Replying to request: "{requestQuery}"
                    </Text>
                )}

                <Card>
                    <Input
                        label="Provider Name"
                        value={name}
                        onChangeText={setName}
                        placeholder="Business or Person Name"
                    />

                    <View className="mb-4">
                        <Text className="text-sm font-medium text-slate-700 mb-1.5">Category</Text>
                        <TouchableOpacity 
                            onPress={() => setCategoryModalVisible(true)}
                            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg flex-row justify-between items-center"
                        >
                            <Text className={categoryId ? 'text-slate-900' : 'text-slate-400'}>
                                {categoryId ? getCategoryName(categoryId) : 'Select Category'}
                            </Text>
                            <Text className="text-slate-400">▼</Text>
                        </TouchableOpacity>
                    </View>

                    <Input
                        label="Contact Details"
                        value={contactDetails}
                        onChangeText={setContactDetails}
                        placeholder="Phone, Email, etc."
                        multiline
                        numberOfLines={3}
                    />

                    <Button 
                        title="Submit for Approval" 
                        onPress={handleSubmit} 
                        loading={loading}
                        className="mt-4"
                    />
                </Card>
            </ScrollView>

            {/* Category Picker Modal */}
            <Modal visible={categoryModalVisible} animationType="fade" transparent>
                <View className="flex-1 bg-black/50 justify-center items-center p-4">
                    <Card className="w-full max-w-sm bg-white max-h-[80%]">
                        <View className="flex-row justify-between items-center mb-4 border-b border-slate-100 pb-4">
                            <Text className="text-lg font-bold text-slate-800">Select Category</Text>
                            <TouchableOpacity onPress={() => setCategoryModalVisible(false)} className="p-1">
                                <Text className="text-slate-400 font-bold text-lg">✕</Text>
                            </TouchableOpacity>
                        </View>
                        
                        <FlatList 
                            data={categories}
                            keyExtractor={item => item.id}
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    className={`p-4 border-b border-slate-50 ${categoryId === item.id ? 'bg-blue-50' : ''}`}
                                    onPress={() => { setCategoryId(item.id); setCategoryModalVisible(false); }}
                                >
                                    <Text className={`text-base ${categoryId === item.id ? 'font-semibold text-blue-700' : 'text-slate-700'}`}>
                                        {item.name}
                                        <Text className="text-slate-400 text-sm"> ({item.group_name})</Text>
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </Card>
                </View>
            </Modal>
        </ScreenLayout>
    );
}

