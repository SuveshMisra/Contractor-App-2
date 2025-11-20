import { View, Text, FlatList, TouchableOpacity, Alert, Modal } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Database } from '../../types/database';

type Category = Database['public']['Tables']['categories']['Row'];

export default function ManageCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [newCategoryGroup, setNewCategoryGroup] = useState('');
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    async function fetchCategories() {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('group_name', { ascending: true })
                .order('name', { ascending: true });
            
            if (error) throw error;
            setCategories(data || []);
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        if (!newCategoryName.trim() || !newCategoryGroup.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            if (editingCategory) {
                const { error } = await supabase
                    .from('categories')
                    .update({ name: newCategoryName, group_name: newCategoryGroup })
                    .eq('id', editingCategory.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('categories')
                    .insert({ name: newCategoryName, group_name: newCategoryGroup });
                if (error) throw error;
            }

            setModalVisible(false);
            setNewCategoryName('');
            setNewCategoryGroup('');
            setEditingCategory(null);
            fetchCategories();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    }

    function openEdit(category: Category) {
        setEditingCategory(category);
        setNewCategoryName(category.name);
        setNewCategoryGroup(category.group_name);
        setModalVisible(true);
    }

    function openCreate() {
        setEditingCategory(null);
        setNewCategoryName('');
        setNewCategoryGroup('');
        setModalVisible(true);
    }

    return (
        <ScreenLayout>
            <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-bold text-slate-900">Categories</Text>
                <Button title="Add New" onPress={openCreate} size="sm" />
            </View>

            <FlatList
                data={categories}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => openEdit(item)}>
                        <Card className="mb-3 p-4 flex-row justify-between items-center">
                            <View>
                                <Text className="font-bold text-slate-800 text-lg">{item.name}</Text>
                                <Text className="text-slate-500 text-sm">{item.group_name}</Text>
                            </View>
                            <Text className="text-blue-600">Edit</Text>
                        </Card>
                    </TouchableOpacity>
                )}
                refreshing={loading}
                onRefresh={fetchCategories}
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View className="flex-1 justify-center items-center bg-black/50 p-4">
                    <Card className="w-full bg-white">
                        <Text className="text-xl font-bold mb-4 text-slate-900">
                            {editingCategory ? 'Edit Category' : 'New Category'}
                        </Text>
                        
                        <Input
                            label="Name"
                            value={newCategoryName}
                            onChangeText={setNewCategoryName}
                            placeholder="e.g. Plumber"
                        />
                        
                        <Input
                            label="Group"
                            value={newCategoryGroup}
                            onChangeText={setNewCategoryGroup}
                            placeholder="e.g. Contractor"
                        />

                        <View className="flex-row gap-3 mt-4">
                            <Button 
                                title="Cancel" 
                                variant="outline" 
                                onPress={() => setModalVisible(false)} 
                                className="flex-1" 
                            />
                            <Button 
                                title="Save" 
                                onPress={handleSave} 
                                className="flex-1" 
                            />
                        </View>
                    </Card>
                </View>
            </Modal>
        </ScreenLayout>
    );
}

