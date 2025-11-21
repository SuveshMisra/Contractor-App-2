import { View, Text, ActivityIndicator, FlatList, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../ctx';
import { useRouter, Link } from 'expo-router';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

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
  surname?: string;
  contact_details?: string;
  stand_number?: string;
  email: string;
  estate?: {
    name: string;
  };
};

export default function ResidentProfile() {
  const { session, signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        // 1. Get Profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, surname, contact_details, stand_number, estate_id')
          .eq('id', session?.user.id)
          .single();

        if (profileError) throw profileError;

        let estateName = '';
        if (profileData.estate_id) {
            const { data: estate } = await supabase
                .from('estates')
                .select('name')
                .eq('id', profileData.estate_id)
                .maybeSingle();
            estateName = estate?.name || '';
        }

        setProfile({
            full_name: profileData.full_name,
            surname: profileData.surname,
            contact_details: profileData.contact_details,
            stand_number: profileData.stand_number,
            email: session?.user.email || '',
            estate: { name: estateName }
        });
      } catch (error) {
        console.error('Error loading profile:', error);
        Alert.alert('Error', 'Failed to load profile data');
      }

      try {
        // 2. Get My Reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('*, contractor:profiles!reviews_contractor_id_fkey(full_name)')
          .eq('resident_id', session?.user.id)
          .order('created_at', { ascending: false });

        if (reviewsError) throw reviewsError;
        
        // @ts-ignore
        setReviews(reviewsData || []);
      } catch (error) {
        console.error('Error loading reviews:', error);
        // Fail silently for reviews or show a separate error if needed, 
        // but don't block profile from showing.
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [session]);

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return <View className="flex-1 justify-center items-center bg-slate-50"><ActivityIndicator color="#2563eb" /></View>;
  }

  return (
    <ScreenLayout>
        <Text className="text-2xl font-bold text-slate-900 mb-6">My Profile</Text>
        
        <Card className="mb-8">
            <View className="mb-6">
                <Text className="text-xl font-bold text-slate-800 mb-1">{profile?.full_name}</Text>
                <Text className="text-slate-500 mb-1">{profile?.email}</Text>
                {profile?.contact_details && <Text className="text-slate-600 mb-1">{profile.contact_details}</Text>}
                {profile?.stand_number && <Text className="text-slate-600 mb-1">Stand: {profile.stand_number}</Text>}
                {profile?.estate?.name && (
                    <View className="bg-blue-50 self-start px-3 py-1 rounded-full mt-2">
                        <Text className="text-blue-700 text-xs font-bold uppercase tracking-wide">{profile.estate.name}</Text>
                    </View>
                )}
            </View>
            
            <View className="flex-row gap-3">
                <Link href="/change-password" asChild>
                    <Button title="Change Password" variant="outline" className="flex-1" />
                </Link>
                <Button title="Sign Out" variant="ghost" onPress={handleSignOut} className="flex-1" />
            </View>
        </Card>

        <Text className="text-xl font-bold text-slate-900 mb-4">My Past Reviews</Text>

        <FlatList
            data={reviews}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
                <Card className="mb-4">
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="font-semibold text-lg text-slate-800">{item.contractor?.full_name || 'Unknown Contractor'}</Text>
                        <View className="flex-row items-center bg-yellow-50 px-2 py-1 rounded border border-yellow-100">
                            <Text className="text-yellow-500 text-xs mr-1">★</Text>
                            <Text className="font-bold text-slate-900">{item.rating}</Text>
                        </View>
                    </View>
                    <Text className="text-slate-600 leading-relaxed mb-3">{item.comment}</Text>
                    <Text className="text-slate-400 text-xs">{new Date(item.created_at).toLocaleDateString()}</Text>
                </Card>
            )}
            ListEmptyComponent={
                <Text className="text-center text-slate-500 py-8 bg-slate-50 rounded-lg border border-slate-100 border-dashed">You haven't written any reviews yet.</Text>
            }
        />
    </ScreenLayout>
  );
}
