import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useAuth } from '../../ctx';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

type Review = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
};

export default function ContractorDashboard() {
  const { session, signOut } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    async function loadReviews() {
        const { data } = await supabase
            .from('reviews')
            .select('*')
            .eq('contractor_id', session?.user.id)
            .order('created_at', { ascending: false });
        
        setReviews(data || []);
        setLoading(false);
    }

    loadReviews();
  }, [session]);

  return (
    <View className="flex-1 p-4 bg-white">
      <View className="flex-row justify-between items-center mb-6">
         <Text className="text-2xl font-bold">My Reviews</Text>
         <TouchableOpacity onPress={signOut} className="bg-red-100 px-3 py-2 rounded-lg">
            <Text className="text-red-600 font-bold">Sign Out</Text>
         </TouchableOpacity>
      </View>

      {loading ? (
          <ActivityIndicator />
      ) : (
          <FlatList
            data={reviews}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
                <View className="bg-gray-50 p-4 rounded-lg mb-3 border border-gray-100">
                    <View className="flex-row justify-between mb-2">
                        <Text className="font-bold text-yellow-600 text-lg">★ {item.rating}</Text>
                        <Text className="text-gray-400 text-xs">{new Date(item.created_at).toLocaleDateString()}</Text>
                    </View>
                    <Text className="text-gray-700">{item.comment}</Text>
                </View>
            )}
            ListEmptyComponent={<Text className="text-gray-500 text-center mt-10">No reviews yet.</Text>}
          />
      )}
    </View>
  );
}

