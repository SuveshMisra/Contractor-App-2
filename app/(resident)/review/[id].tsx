import { View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../ctx';
import { ScreenLayout } from '../../../components/ScreenLayout';
import { Card } from '../../../components/Card';
import { Button } from '../../../components/Button';

export default function WriteReview() {
  const { id } = useLocalSearchParams(); // contractor_id
  const { session } = useAuth();
  const router = useRouter();
  
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submitReview() {
    if (!session) return;
    if (!comment.trim()) {
        Alert.alert("Please enter a comment");
        return;
    }

    setSubmitting(true);
    
    const { error } = await supabase
      .from('reviews')
      .insert({
        contractor_id: id as string,
        resident_id: session.user.id,
        rating,
        comment,
      });

    setSubmitting(false);

    if (error) {
      Alert.alert("Error", error.message);
    } else {
      Alert.alert("Success", "Review submitted!");
      router.back();
    }
  }

  return (
    <ScreenLayout className="justify-center items-center">
      <Card className="w-full max-w-lg">
        <Text className="text-2xl font-bold mb-6 text-slate-800">Write a Review</Text>

        <Text className="text-sm font-medium text-slate-700 mb-2">Rating</Text>
        <View className="flex-row mb-6 bg-slate-50 p-3 rounded-lg justify-center border border-slate-100">
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)} className="mx-2">
              <Text className={`text-4xl ${star <= rating ? 'text-yellow-400' : 'text-slate-200'}`}>
                ★
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text className="text-sm font-medium text-slate-700 mb-2">Comment</Text>
        <TextInput
          className="w-full px-3 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 mb-6 h-32 text-top"
          multiline
          placeholder="Describe your experience..."
          placeholderTextColor="#94a3b8"
          value={comment}
          onChangeText={setComment}
          textAlignVertical="top"
        />

        <Button 
            title="Submit Review"
            onPress={submitReview}
            loading={submitting}
        />
        
        <Button 
            title="Cancel"
            variant="ghost"
            onPress={() => router.back()}
            disabled={submitting}
            className="mt-2"
        />
      </Card>
    </ScreenLayout>
  );
}
