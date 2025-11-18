import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../ctx';

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
    <View className="flex-1 p-6 bg-white">
      <Text className="text-2xl font-bold mb-6">Write a Review</Text>

      <Text className="text-lg font-semibold mb-2">Rating</Text>
      <View className="flex-row mb-6">
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)} className="mr-2">
            <Text className={`text-3xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'}`}>
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text className="text-lg font-semibold mb-2">Comment</Text>
      <TextInput
        className="border border-gray-300 rounded-lg p-3 h-32 bg-gray-50 text-top"
        multiline
        placeholder="Describe your experience..."
        value={comment}
        onChangeText={setComment}
        textAlignVertical="top"
      />

      <TouchableOpacity 
        className={`bg-blue-600 p-4 rounded-lg mt-6 ${submitting ? 'opacity-50' : ''}`}
        onPress={submitReview}
        disabled={submitting}
      >
        {submitting ? (
            <ActivityIndicator color="white" />
        ) : (
            <Text className="text-white text-center font-bold text-lg">Submit Review</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

