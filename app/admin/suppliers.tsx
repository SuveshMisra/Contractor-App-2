import { View, Text, FlatList, TouchableOpacity, Alert, Modal, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Database } from '../../types/database';

type Supplier = Database['public']['Tables']['suppliers']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

export default function ManageSuppliers() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    
    // Form State
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [contactDetails, setContactDetails] = useState('');
    const [status, setStatus] = useState<'active' | 'inactive' | 'pending' | 'defunct'>('active');
    
    // Category Modal
    const [categoryModalVisible, setCategoryModalVisible] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);
        try {
            const [suppliersRes, categoriesRes] = await Promise.all([
                supabase.from('suppliers').select('*').order('name'),
                supabase.from('categories').select('*').order('name')
            ]);

            if (suppliersRes.error) throw suppliersRes.error;
            if (categoriesRes.error) throw categoriesRes.error;

            setSuppliers(suppliersRes.data || []);
            setCategories(categoriesRes.data || []);
        } catch (error) {
            Alert.alert('Error', 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }

    const filteredSuppliers = suppliers.filter(s => 
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    async function handleSave() {
        if (!name.trim() || !categoryId) {
            Alert.alert('Error', 'Name and Category are required');
            return;
        }

        try {
            const payload = {
                name,
                category_id: categoryId,
                contact_details: contactDetails,
                status
            };

            if (editingSupplier) {
                const { error } = await supabase
                    .from('suppliers')
                    .update(payload)
                    .eq('id', editingSupplier.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('suppliers')
                    .insert(payload);
                if (error) throw error;
            }

            setModalVisible(false);
            resetForm();
            fetchData();
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    }

    function resetForm() {
        setName('');
        setCategoryId(null);
        setContactDetails('');
        setStatus('active');
        setEditingSupplier(null);
    }

    function openEdit(supplier: Supplier) {
        setEditingSupplier(supplier);
        setName(supplier.name);
        setCategoryId(supplier.category_id);
        setContactDetails(supplier.contact_details || '');
        setStatus(supplier.status);
        setModalVisible(true);
    }

    function openCreate() {
        resetForm();
        setModalVisible(true);
    }

    function getCategoryName(id: string | null) {
        if (!id) return '';
        return categories.find(c => c.id === id)?.name || '';
    }

    return (
        <ScreenLayout>
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-2xl font-bold text-slate-900">Suppliers</Text>
                <Button title="Add New" onPress={openCreate} size="sm" />
            </View>

            <Input 
                placeholder="Search suppliers..." 
                value={searchQuery} 
                onChangeText={setSearchQuery} 
                className="mb-4"
            />

            <FlatList
                data={filteredSuppliers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => openEdit(item)}>
                        <Card className="mb-3 p-4">
                            <View className="flex-row justify-between items-start">
                                <View>
                                    <Text className="font-bold text-slate-800 text-lg">{item.name}</Text>
                                    <Text className="text-slate-500 text-sm">{getCategoryName(item.category_id)}</Text>
                                </View>
                                <View className={`px-2 py-1 rounded-full ${
                                    item.status === 'active' ? 'bg-green-100' : 
                                    item.status === 'pending' ? 'bg-orange-100' : 'bg-slate-100'
                                }`}>
                                    <Text className={`text-xs font-bold uppercase ${
                                        item.status === 'active' ? 'text-green-700' :
                                        item.status === 'pending' ? 'text-orange-700' : 'text-slate-500'
                                    }`}>{item.status}</Text>
                                </View>
                            </View>
                            {item.contact_details && <Text className="text-slate-600 mt-2 text-sm">{item.contact_details}</Text>}
                        </Card>
                    </TouchableOpacity>
                )}
                refreshing={loading}
                onRefresh={fetchData}
            />

            {/* Edit/Create Modal */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View className="flex-1 justify-center items-center bg-black/50 p-4">
                    <Card className="w-full bg-white max-h-[90%]">
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text className="text-xl font-bold mb-4 text-slate-900">
                                {editingSupplier ? 'Edit Supplier' : 'New Supplier'}
                            </Text>
                            
                            <Input
                                label="Name"
                                value={name}
                                onChangeText={setName}
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
                                multiline
                                numberOfLines={3}
                            />

                            <View className="mb-4">
                                <Text className="text-sm font-medium text-slate-700 mb-1.5">Status</Text>
                                <View className="flex-row flex-wrap gap-2">
                                    {['active', 'inactive', 'pending', 'defunct'].map((s) => (
                                        <TouchableOpacity
                                            key={s}
                                            onPress={() => setStatus(s as any)}
                                            className={`px-3 py-2 rounded-md border ${
                                                status === s ? 'bg-blue-50 border-blue-500' : 'bg-white border-slate-200'
                                            }`}
                                        >
                                            <Text className={`capitalize ${status === s ? 'text-blue-700 font-medium' : 'text-slate-600'}`}>
                                                {s}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

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
                        </ScrollView>
                    </Card>
                </View>
            </Modal>

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

