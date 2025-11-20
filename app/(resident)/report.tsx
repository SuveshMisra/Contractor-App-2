import { View, Text, Alert, TextInput } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../ctx';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export default function ReportPage() {
    const { type, supplierId, name, query } = useLocalSearchParams<{ type: string, supplierId: string, name: string, query: string }>();
    const { session } = useAuth();
    const router = useRouter();
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const isRecommendationRequest = type === 'recommendation_request';
    const isIncorrectDetails = !!supplierId;
    
    // Default to general snag/suggestion if not specified
    const reportType = isRecommendationRequest ? 'recommendation_request' : 
                      isIncorrectDetails ? 'incorrect_details' : 
                      (type || 'snag');

    const title = isRecommendationRequest ? 'Request Recommendation' :
                 isIncorrectDetails ? 'Report Incorrect Details' :
                 type === 'suggestion' ? 'Make a Suggestion' : 'Log a Snag';

    async function handleSubmit() {
        if (!description.trim()) {
            Alert.alert('Error', 'Please provide a description');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.from('reports').insert({
                user_id: session?.user.id!,
                supplier_id: supplierId || null,
                type: reportType as any,
                description: isRecommendationRequest ? `Looking for: ${query}. ${description}` : description,
                status: 'open'
            });

            if (error) throw error;

            Alert.alert('Success', 'Submitted successfully', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to submit');
        } finally {
            setLoading(false);
        }
    }

    return (
        <ScreenLayout>
            <Card>
                <Text className="text-2xl font-bold text-slate-900 mb-2">{title}</Text>
                
                {isIncorrectDetails && (
                    <Text className="text-slate-500 mb-4">Reporting for: <Text className="font-bold">{name}</Text></Text>
                )}

                {isRecommendationRequest && (
                    <Text className="text-slate-500 mb-4">
                        You searched for "<Text className="font-bold">{query}</Text>". 
                        Describe what you are looking for so others can help.
                    </Text>
                )}

                <Text className="text-sm font-medium text-slate-700 mb-2">Description</Text>
                <TextInput
                    className="bg-white border border-slate-300 rounded-lg p-3 h-32 text-base mb-6"
                    placeholder={isRecommendationRequest ? "e.g. I need a reliable plumber for a burst pipe..." : "Describe the issue..."}
                    multiline
                    textAlignVertical="top"
                    value={description}
                    onChangeText={setDescription}
                />

                <Button 
                    title="Submit" 
                    onPress={handleSubmit} 
                    loading={loading}
                />
            </Card>
        </ScreenLayout>
    );
}

