import { View, Text, FlatList, TouchableOpacity, Modal } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { Database } from '../../types/database';
import { useRouter } from 'expo-router';

type Supplier = Database['public']['Tables']['suppliers']['Row'] & {
    category: { name: string }
};
type Category = Database['public']['Tables']['categories']['Row'];

export default function TopProviders() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'rating' | 'name'>('rating');
    const [filterModalVisible, setFilterModalVisible] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadData();
    }, [selectedCategory, sortBy]);

    async function loadData() {
        setLoading(true);
        try {
            // Load Categories once
            if (categories.length === 0) {
                const { data: cats } = await supabase.from('categories').select('*').order('name');
                if (cats) setCategories(cats);
            }

            let query = supabase
                .from('suppliers')
                .select('*, category:categories(name)')
                .eq('status', 'active');

            if (selectedCategory) {
                query = query.eq('category_id', selectedCategory);
            }

            if (sortBy === 'rating') {
                query = query.order('upvotes', { ascending: false });
            } else {
                query = query.order('name', { ascending: true });
            }

            const { data, error } = await query;
            if (error) throw error;
            
            // @ts-ignore
            setSuppliers(data || []);

        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScreenLayout>
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-2xl font-bold text-slate-900">Top Providers</Text>
                <TouchableOpacity onPress={() => setFilterModalVisible(true)} className="bg-blue-100 px-3 py-2 rounded-lg">
                    <Text className="text-blue-700 font-medium">Filter & Sort</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={suppliers}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <Card className="mb-3 p-4">
                        <View className="flex-row justify-between items-start">
                            <View>
                                <Text className="font-bold text-slate-800 text-lg">{item.name}</Text>
                                <Text className="text-slate-500 text-sm">{item.category?.name}</Text>
                            </View>
                            <View className="flex-row items-center bg-green-50 px-2 py-1 rounded-lg">
                                <Text className="text-green-700 font-bold mr-1">👍 {item.upvotes}</Text>
                                <Text className="text-red-400 text-xs font-medium ml-1">👎 {item.downvotes}</Text>
                            </View>
                        </View>
                        {item.contact_details && <Text className="text-slate-600 mt-2 text-sm">{item.contact_details}</Text>}
                    </Card>
                )}
                refreshing={loading}
                onRefresh={loadData}
                ListEmptyComponent={<Text className="text-center text-slate-500 mt-10">No providers found.</Text>}
            />

            <Modal visible={filterModalVisible} animationType="slide" transparent>
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-slate-900">Filter & Sort</Text>
                            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                                <Text className="text-slate-400 text-2xl">✕</Text>
                            </TouchableOpacity>
                        </View>

                        <Text className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Sort By</Text>
                        <View className="flex-row gap-3 mb-6">
                            <TouchableOpacity 
                                onPress={() => setSortBy('rating')}
                                className={`flex-1 py-3 rounded-lg border items-center ${sortBy === 'rating' ? 'bg-blue-50 border-blue-500' : 'bg-white border-slate-200'}`}
                            >
                                <Text className={sortBy === 'rating' ? 'text-blue-700 font-bold' : 'text-slate-600'}>Rating</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => setSortBy('name')}
                                className={`flex-1 py-3 rounded-lg border items-center ${sortBy === 'name' ? 'bg-blue-50 border-blue-500' : 'bg-white border-slate-200'}`}
                            >
                                <Text className={sortBy === 'name' ? 'text-blue-700 font-bold' : 'text-slate-600'}>Name</Text>
                            </TouchableOpacity>
                        </View>

                        <Text className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Category</Text>
                        <FlatList
                            data={[{id: null, name: 'All Categories'}, ...categories]}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="mb-6 max-h-12"
                            renderItem={({ item }) => (
                                <TouchableOpacity 
                                    onPress={() => setSelectedCategory(item.id)}
                                    className={`mr-2 px-4 py-2 rounded-full border ${
                                        selectedCategory === item.id ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'
                                    }`}
                                >
                                    <Text className={selectedCategory === item.id ? 'text-white font-medium' : 'text-slate-600'}>
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />

                        <Button title="Done" onPress={() => setFilterModalVisible(false)} />
                    </View>
                </View>
            </Modal>
        </ScreenLayout>
    );
}

