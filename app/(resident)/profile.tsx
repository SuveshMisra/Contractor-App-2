import { View, Text, ActivityIndicator, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../ctx';
import { useRouter } from 'expo-router';

type Review = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  contractor: {
    full_name: string;
  };
};

type Profile = {
  full_name: string;
  email: string; // Assuming email is available or we can fetch from auth user
  estate?: {
    name: string;
  };
};

export default function ResidentProfile() {
  const { session, signOut } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;

    async function loadData() {
      try {
        // 1. Get Profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, estate_id')
          .eq('id', session?.user.id)
          .single();

        if (profileError) throw profileError;

        let estateName = '';
        if (profileData.estate_id) {
            const { data: estate } = await supabase
                .from('estates')
                .select('name')
                .eq('id', profileData.estate_id)
                .single();
            estateName = estate?.name || '';
        }

        setProfile({
            full_name: profileData.full_name,
            email: session?.user.email || '',
            estate: { name: estateName }
        });

        // 2. Get My Reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*, contractor:profiles!reviews_contractor_id_fkey(full_name)')
          .eq('resident_id', session?.user.id)
          .order('created_at', { ascending: false });

        if (reviewsError) throw reviewsError;
        
        // Transform data to match type if necessary (supabase join returns object/array)
        // @ts-ignore
        setReviews(reviewsData || []);

      } catch (error) {
        console.error('Error loading profile:', error);
        Alert.alert('Error', 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [session]);

  const handleSignOut = async () => {
    await signOut();
    // router.replace('/'); // Auth context usually handles redirect
  };

  if (loading) {
    return <View className="flex-1 justify-center items-center"><ActivityIndicator /></View>;
  }

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <Text className="text-2xl font-bold text-gray-800 mb-2">{profile?.full_name}</Text>
        <Text className="text-gray-600 mb-1">{profile?.email}</Text>
        {profile?.estate?.name && (
            <Text className="text-gray-500">Estate: {profile.estate.name}</Text>
        )}
        
        <TouchableOpacity onPress={handleSignOut} className="mt-4 bg-gray-200 p-3 rounded-md items-center">
            <Text className="text-gray-700 font-semibold">Sign Out</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-xl font-bold text-gray-800 mb-4">My Past Reviews</Text>

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="bg-white p-4 rounded-lg mb-3 shadow-sm">
            <View className="flex-row justify-between mb-2">
                <Text className="font-semibold text-lg">{item.contractor?.full_name || 'Unknown Contractor'}</Text>
                <Text className="font-bold text-yellow-600">★ {item.rating}</Text>
            </View>
            <Text className="text-gray-700 mb-2">{item.comment}</Text>
            <Text className="text-gray-400 text-xs">{new Date(item.created_at).toLocaleDateString()}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 py-8">You haven't written any reviews yet.</Text>
        }
      />
    </View>
  );
}

