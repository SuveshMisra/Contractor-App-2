import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../ctx';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useRouter } from 'expo-router';
import { Database } from '../../types/database';

type Supplier = Database['public']['Tables']['suppliers']['Row'] & {
    category?: { name: string; group_name: string };
    user_vote?: 'up' | 'down' | null;
};

export default function SearchProviders() {
    const { session } = useAuth();
    const router = useRouter();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (query.trim().length > 1) {
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
            setSearching(true);
            searchTimeout.current = setTimeout(() => {
                performSearch(query);
            }, 500); // Debounce
        } else {
            setResults([]);
            setSearching(false);
        }
        return () => {
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
        };
    }, [query]);

    async function performSearch(searchText: string) {
        try {
            // Simple ILIKE search on name or category name
            // Note: Supabase ILIKE on joined tables is tricky. 
            // We'll search suppliers by name first, then fetch votes.
            
            const { data, error } = await supabase
                .from('suppliers')
                .select('*, category:categories(name, group_name)')
                .ilike('name', `%${searchText}%`)
                .eq('status', 'active')
                .order('upvotes', { ascending: false });

            if (error) throw error;

            // Fetch user's votes for these suppliers
            if (data && data.length > 0) {
                const supplierIds = data.map(s => s.id);
                const { data: votes } = await supabase
                    .from('supplier_votes')
                    .select('supplier_id, vote_direction')
                    .eq('user_id', session?.user.id!)
                    .in('supplier_id', supplierIds);

                const resultsWithVotes = data.map(s => ({
                    ...s,
                    user_vote: votes?.find(v => v.supplier_id === s.id)?.vote_direction as 'up' | 'down' | null
                }));
                
                setResults(resultsWithVotes);
            } else {
                setResults([]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSearching(false);
        }
    }

    async function handleVote(supplierId: string, direction: 'up' | 'down') {
        if (!session?.user) return;

        const supplierIndex = results.findIndex(s => s.id === supplierId);
        if (supplierIndex === -1) return;

        const s = results[supplierIndex];
        const currentVote = s.user_vote;
        let newUpvotes = s.upvotes;
        let newDownvotes = s.downvotes;
        let newVote = direction;

        // Calculate new state locally
        if (currentVote === direction) {
            // Toggle off
            newVote = null as any;
            if (direction === 'up') newUpvotes--;
            else newDownvotes--;
        } else {
            // Change vote or new vote
            if (currentVote) {
                // Remove old vote effect
                if (currentVote === 'up') newUpvotes--;
                else newDownvotes--;
            }
            
            // Add new vote effect
            if (direction === 'up') newUpvotes++;
            else newDownvotes++;
        }

        // Optimistic update
        const newResults = [...results];
        newResults[supplierIndex] = {
            ...s,
            upvotes: newUpvotes,
            downvotes: newDownvotes,
            user_vote: newVote as 'up' | 'down' | null
        };
        setResults(newResults);

        // Perform DB updates
        try {
            console.log('Starting vote update for:', supplierId, 'direction:', direction);
            console.log('Current vote state:', currentVote);

            if (currentVote === direction) {
                console.log('Removing vote...');
                // Remove vote
                const { error: deleteError } = await supabase.from('supplier_votes').delete()
                    .match({ supplier_id: supplierId, user_id: session.user.id });
                
                if (deleteError) {
                    console.error('Delete vote error:', deleteError);
                    throw deleteError;
                }
                console.log('Vote removed from table');

                const { error: rpcError } = await supabase.rpc('decrement_vote', { row_id: supplierId, vote_type: direction });
                if (rpcError) {
                    console.error('Decrement RPC error:', rpcError);
                    throw rpcError;
                }
                console.log('Vote count decremented');

            } else {
                if (currentVote) {
                     console.log('Removing old vote...', currentVote);
                     const { error: rpcDecError } = await supabase.rpc('decrement_vote', { row_id: supplierId, vote_type: currentVote });
                     if (rpcDecError) {
                        console.error('Decrement RPC error (swap):', rpcDecError);
                        throw rpcDecError;
                     }
                }
                
                console.log('Incrementing new vote...', direction);
                const { error: rpcIncError } = await supabase.rpc('increment_vote', { row_id: supplierId, vote_type: direction });
                if (rpcIncError) {
                    console.error('Increment RPC error:', rpcIncError);
                    throw rpcIncError;
                }

                console.log('Upserting vote record...');
                const { error: upsertError } = await supabase.from('supplier_votes').upsert({
                    supplier_id: supplierId,
                    user_id: session.user.id,
                    vote_direction: direction
                }, { onConflict: 'supplier_id, user_id' });

                if (upsertError) {
                    console.error('Upsert vote error:', upsertError);
                    throw upsertError;
                }
                console.log('Vote record upserted');
            }
            console.log('Vote update complete');
        } catch (error) {
            console.error('Vote error:', error);
            // Revert on error
            setResults(results); 
            Alert.alert('Error', 'Failed to submit vote');
        }
    }

    function reportIncorrect(supplier: Supplier) {
        // router.push({ pathname: '/(resident)/report', params: { supplierId: supplier.id, name: supplier.name } });
        // Passing params via context or url params if strictly string
        router.push(`/(resident)/report?supplierId=${supplier.id}&name=${encodeURIComponent(supplier.name)}`);
    }

    function requestRecommendation() {
        router.push(`/(resident)/report?type=recommendation_request&query=${encodeURIComponent(query)}`);
    }

    return (
        <ScreenLayout>
            <View className="mb-4">
                <Text className="text-2xl font-bold text-slate-900 mb-4">Find Service Provider</Text>
                <TextInput 
                    className="bg-white border border-slate-300 rounded-lg px-4 py-3 text-lg shadow-sm"
                    placeholder="Search e.g. Plumber, Electrician..."
                    value={query}
                    onChangeText={setQuery}
                    autoFocus
                />
            </View>

            {searching && <ActivityIndicator className="mt-4" color="#2563eb" />}

            <FlatList
                data={results}
                keyExtractor={item => item.id}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item }) => (
                    <Card className="mb-4 p-4">
                        <View className="flex-row justify-between items-start mb-2">
                            <View className="flex-1 mr-2">
                                <Text className="text-xl font-bold text-slate-900">{item.name}</Text>
                                <Text className="text-slate-500 font-medium">{item.category?.name} ({item.category?.group_name})</Text>
                            </View>
                            <View className="items-end">
                                <Text className="text-green-600 font-bold text-lg">+{item.upvotes}</Text>
                                <Text className="text-red-500 font-bold text-sm">-{item.downvotes}</Text>
                            </View>
                        </View>

                        <Text className="text-slate-600 mb-4">{item.contact_details}</Text>

                        <View className="flex-row gap-3">
                            <TouchableOpacity 
                                onPress={() => handleVote(item.id, 'up')}
                                className={`flex-1 py-3 rounded-lg border items-center justify-center ${
                                    item.user_vote === 'up' ? 'bg-green-600 border-green-600' : 'bg-white border-green-600'
                                }`}
                            >
                                <Text className={`font-bold text-lg ${item.user_vote === 'up' ? 'text-white' : 'text-green-600'}`}>👍 Recommend</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                onPress={() => handleVote(item.id, 'down')}
                                className={`flex-1 py-3 rounded-lg border items-center justify-center ${
                                    item.user_vote === 'down' ? 'bg-red-500 border-red-500' : 'bg-white border-red-500'
                                }`}
                            >
                                <Text className={`font-bold text-lg ${item.user_vote === 'down' ? 'text-white' : 'text-red-500'}`}>👎 Downvote</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={() => reportIncorrect(item)} className="mt-3 self-center">
                            <Text className="text-slate-400 text-xs underline">Report incorrect details</Text>
                        </TouchableOpacity>
                    </Card>
                )}
                ListEmptyComponent={
                    !searching && query.length > 1 ? (
                        <View className="items-center mt-8 px-4">
                            <Text className="text-slate-500 text-center mb-4 text-lg">No providers found matching "{query}"</Text>
                            <Button 
                                title="Request Recommendation" 
                                onPress={requestRecommendation}
                                className="w-full"
                            />
                            <Text className="text-slate-400 text-center mt-2 text-sm">
                                This will notify other users to recommend a provider.
                            </Text>
                        </View>
                    ) : null
                }
            />
        </ScreenLayout>
    );
}

