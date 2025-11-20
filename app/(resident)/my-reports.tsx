import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../ctx';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { Database } from '../../types/database';

type Report = Database['public']['Tables']['reports']['Row'];

export default function MyReports() {
    const { session } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    async function fetchReports() {
        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .eq('user_id', session?.user.id!)
            .order('created_at', { ascending: false });
        
        if (!error) setReports(data || []);
        setLoading(false);
    }

    return (
        <ScreenLayout>
            <Text className="text-2xl font-bold text-slate-900 mb-6">My Reports</Text>
            
            <FlatList
                data={reports}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <Card className="mb-4 p-4">
                        <View className="flex-row justify-between items-start mb-2">
                            <Text className="font-bold text-slate-800 capitalize">{item.type.replace('_', ' ')}</Text>
                            <Text className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                                item.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                            }`}>{item.status}</Text>
                        </View>
                        <Text className="text-slate-600 mb-2">{item.description}</Text>
                        <Text className="text-slate-400 text-xs">{new Date(item.created_at).toLocaleDateString()}</Text>
                    </Card>
                )}
                ListEmptyComponent={<Text className="text-center text-slate-500 mt-10">No reports found.</Text>}
                refreshing={loading}
                onRefresh={fetchReports}
            />
        </ScreenLayout>
    );
}

