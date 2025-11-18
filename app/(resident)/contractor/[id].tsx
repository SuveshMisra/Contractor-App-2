import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

type Review = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  resident_id: string; // Ideally fetch resident name too
};

type Contractor = {
  id: string;
  full_name: string;
};

export default function ContractorDetail() {
  const { id } = useLocalSearchParams();
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadContractor() {
      if (typeof id !== 'string') return;
      
      // Fetch Contractor Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name')
        .eq('id', id)
        .single();
      
      setContractor(profile);

      // Fetch Reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('*')
        .eq('contractor_id', id)
        .order('created_at', { ascending: false });
      
      setReviews(reviewsData || []);
      setLoading(false);
    }

    loadContractor();
  }, [id]);

  if (loading) {
    return <View className="flex-1 justify-center items-center"><ActivityIndicator /></View>;
  }

  if (!contractor) {
    return <View className="flex-1 justify-center items-center"><Text>Contractor not found</Text></View>;
  }

  const averageRating = reviews.length 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : 'N/A';

  return (
    <ScrollView className="flex-1 bg-gray-50 p-4">
      <View className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <Text className="text-3xl font-bold text-gray-800 mb-2">{contractor.full_name}</Text>
        <View className="flex-row items-center">
             <Text className="text-yellow-500 text-xl font-bold mr-2">★ {averageRating}</Text>
             <Text className="text-gray-500">({reviews.length} reviews)</Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-800">Reviews</Text>
        <Link href={`/(resident)/review/${id}`} asChild>
            <TouchableOpacity className="bg-blue-600 px-4 py-2 rounded-md">
                <Text className="text-white font-semibold">Write Review</Text>
            </TouchableOpacity>
        </Link>
      </View>

      {reviews.map((review) => (
        <View key={review.id} className="bg-white p-4 rounded-lg mb-3 shadow-sm">
          <View className="flex-row justify-between mb-2">
            <Text className="font-bold text-yellow-600">★ {review.rating}</Text>
            <Text className="text-gray-400 text-xs">{new Date(review.created_at).toLocaleDateString()}</Text>
          </View>
          <Text className="text-gray-700">{review.comment}</Text>
        </View>
      ))}
      
      {reviews.length === 0 && (
        <Text className="text-center text-gray-500 py-8">No reviews yet. Be the first!</Text>
      )}
    </ScrollView>
  );
}

