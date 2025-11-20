import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { useRouter } from 'expo-router';
import { Database } from '../../types/database';

type Report = Database['public']['Tables']['reports']['Row'] & {
    user?: { full_name: string }
};

export default function Notifications() {
    const [notifications, setNotifications] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchNotifications();
    }, []);

    async function fetchNotifications() {
        try {
            const threeDaysAgo = new Date();
            threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

            const { data, error } = await supabase
                .from('reports')
                .select('*, user:profiles(full_name)')
                .eq('type', 'recommendation_request')
                .gt('created_at', threeDaysAgo.toISOString())
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotifications(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    function handleRecommend(request: Report) {
        // User wants to recommend a provider for this request.
        // They can either search existing or add new.
        // For now, route them to Search, passing the query?
        // Or route to a "Suggest Provider" form?
        // Spec: "A user going into this will submit details of a service provider to our admin for approval."
        // So it's an "Add Supplier" form.
        router.push({ pathname: '/(resident)/add-supplier', params: { requestId: request.id, requestQuery: request.description } });
    }

    return (
        <ScreenLayout>
            <Text className="text-2xl font-bold text-slate-900 mb-6">Notifications</Text>
            
            <FlatList
                data={notifications}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <Card className="mb-4 p-4 bg-yellow-50 border-yellow-100">
                        <View className="flex-row justify-between items-start mb-2">
                            <Text className="font-bold text-slate-800 text-lg">Recommendation Request</Text>
                            <Text className="text-xs text-slate-500">{new Date(item.created_at).toLocaleDateString()}</Text>
                        </View>
                        <Text className="text-slate-600 mb-2">
                            <Text className="font-semibold">{item.user?.full_name}</Text> is asking for:
                        </Text>
                        <Text className="text-slate-800 font-medium italic mb-4">"{item.description}"</Text>
                        
                        <TouchableOpacity 
                            onPress={() => handleRecommend(item)}
                            className="bg-blue-600 py-2 px-4 rounded-lg self-start"
                        >
                            <Text className="text-white font-semibold">Suggest a Provider</Text>
                        </TouchableOpacity>
                    </Card>
                )}
                ListEmptyComponent={
                    <Text className="text-center text-slate-500 mt-10">No active requests.</Text>
                }
                refreshing={loading}
                onRefresh={fetchNotifications}
            />
        </ScreenLayout>
    );
}

