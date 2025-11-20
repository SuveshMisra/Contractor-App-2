import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { ScreenLayout } from '../../../components/ScreenLayout';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';

type Review = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  resident_id: string;
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
    return <View className="flex-1 justify-center items-center bg-slate-50"><ActivityIndicator color="#2563eb" /></View>;
  }

  if (!contractor) {
    return (
        <ScreenLayout className="justify-center items-center">
            <Text className="text-slate-500">Contractor not found</Text>
        </ScreenLayout>
    );
  }

  const averageRating = reviews.length 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : 'N/A';

  return (
    <ScreenLayout>
      <Card className="mb-8 p-6">
        <Text className="text-3xl font-bold text-slate-900 mb-2">{contractor.full_name}</Text>
        <View className="flex-row items-center">
             <Text className="text-yellow-500 text-2xl font-bold mr-2">★ {averageRating}</Text>
             <Text className="text-slate-500 text-lg">({reviews.length} reviews)</Text>
        </View>
      </Card>

      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-2xl font-bold text-slate-900">Reviews</Text>
        <Link href={`/(resident)/review/${id}`} asChild>
            <Button title="Write Review" className="px-4" />
        </Link>
      </View>

      {reviews.map((review) => (
        <Card key={review.id} className="mb-4">
          <View className="flex-row justify-between mb-2">
            <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded border border-yellow-100">
                <Text className="text-yellow-500 text-xs mr-1">★</Text>
                <Text className="font-bold text-slate-900">{review.rating}</Text>
            </View>
            <Text className="text-slate-400 text-xs">{new Date(review.created_at).toLocaleDateString()}</Text>
          </View>
          <Text className="text-slate-700 leading-relaxed">{review.comment}</Text>
        </Card>
      ))}
      
      {reviews.length === 0 && (
        <Text className="text-center text-slate-500 py-10 bg-slate-50 rounded-lg border border-slate-100 border-dashed">No reviews yet. Be the first!</Text>
      )}
    </ScreenLayout>
  );
}
