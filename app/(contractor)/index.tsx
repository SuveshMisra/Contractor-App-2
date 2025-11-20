import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../ctx';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

type Review = {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export default function ContractorDashboard() {
  const { session, signOut } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    async function loadReviews() {
        if (!session?.user) return; 

        const { data } = await supabase
            .from('reviews')
            .select('*')
            .eq('contractor_id', session.user.id)
            .order('created_at', { ascending: false });
        
        setReviews(data || []);
        setLoading(false);
    }

    loadReviews();
  }, [session]);

  return (
    <ScreenLayout>
      <View className="flex-row justify-between items-start mb-6">
         <View>
            <Text className="text-3xl font-bold text-slate-900">My Reviews</Text>
            <Text className="text-slate-500 mt-1">Feedback from residents.</Text>
         </View>
         <View className="flex-row gap-2">
             <Link href="/change-password" asChild>
                <Button title="Pwd" variant="outline" className="px-3 h-10" />
             </Link>
             <Button title="Sign Out" variant="ghost" className="px-3 h-10" onPress={signOut} />
         </View>
      </View>

      {loading ? (
          <View className="py-10"><ActivityIndicator color="#2563eb" /></View>
      ) : (
          <FlatList
            data={reviews}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
                <Card className="mb-4 p-4">
                    <View className="flex-row justify-between mb-2">
                        <View className="flex-row items-center">
                            <Text className="font-bold text-yellow-500 text-lg mr-1">★</Text>
                            <Text className="font-bold text-slate-900 text-lg">{item.rating}</Text>
                        </View>
                        <Text className="text-slate-400 text-xs">{new Date(item.created_at).toLocaleDateString()}</Text>
                    </View>
                    {item.comment ? (
                        <Text className="text-slate-700 leading-relaxed">{item.comment}</Text>
                    ) : (
                        <Text className="text-slate-400 italic">No comment provided.</Text>
                    )}
                </Card>
            )}
            ListEmptyComponent={<Text className="text-slate-500 text-center py-10 bg-slate-50 rounded-lg border border-slate-100 border-dashed">No reviews yet.</Text>}
          />
      )}
    </ScreenLayout>
  );
}
