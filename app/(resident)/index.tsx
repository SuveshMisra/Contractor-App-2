import { View, Text, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter, Link } from 'expo-router';
import { useAuth } from '../../ctx';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { supabase } from '../../lib/supabase';

export default function ResidentHome() {
  const { session } = useAuth();
  const router = useRouter();
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
      // Check for unread notifications (recommendation requests mainly)
      // For MVP, we just count open 'recommendation_request' reports from others?
      // Spec: "Notification needs to stay open for 3 days, as multiple users can submit recommendations."
      // So we check for reports of type 'recommendation_request' created in last 3 days.
      
      checkNotifications();
  }, []);

  async function checkNotifications() {
      try {
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
        
        const { count } = await supabase
            .from('reports')
            .select('*', { count: 'exact', head: true })
            .eq('type', 'recommendation_request')
            .gt('created_at', threeDaysAgo.toISOString());
        
        setUnreadNotifications(count || 0);
      } catch (e) {
          console.error(e);
      }
  }

  return (
    <ScreenLayout>
      <View className="flex-row justify-between items-center mb-8">
        <View>
            <Text className="text-3xl font-bold text-slate-900">Welcome</Text>
            <Text className="text-slate-500 text-lg">{session?.user.user_metadata.full_name?.split(' ')[0] || 'Resident'}</Text>
        </View>
        
        <Link href="/(resident)/notifications" asChild>
            <TouchableOpacity className="relative p-2">
                <Text className="text-3xl">🔔</Text>
                {unreadNotifications > 0 && (
                    <View className="absolute top-0 right-0 bg-red-500 rounded-full w-5 h-5 justify-center items-center border border-white">
                        <Text className="text-white text-xs font-bold">{unreadNotifications}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </Link>
      </View>
      
      <View className="space-y-4">
        <TouchableOpacity 
            className="bg-blue-600 rounded-xl p-6 shadow-lg active:bg-blue-700"
            onPress={() => router.push('/(resident)/search')}
        >
            <Text className="text-white text-2xl font-bold text-center mb-1">🔍 Search Service Provider</Text>
            <Text className="text-blue-100 text-center text-sm">Find & Recommend Providers</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            className="bg-indigo-600 rounded-xl p-6 shadow-lg active:bg-indigo-700"
            onPress={() => router.push('/(resident)/top-providers')}
        >
            <Text className="text-white text-2xl font-bold text-center mb-1">⭐ Top Providers</Text>
            <Text className="text-indigo-100 text-center text-sm">Browse by Category & Rating</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 active:bg-slate-50"
            onPress={() => router.push('/(resident)/my-reports')}
        >
            <Text className="text-slate-800 text-xl font-bold text-center mb-1">📄 Reports</Text>
            <Text className="text-slate-500 text-center text-sm">View your history</Text>
        </TouchableOpacity>

        <TouchableOpacity 
            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 active:bg-slate-50"
            onPress={() => router.push('/(resident)/report?type=snag')}
        >
            <Text className="text-slate-800 text-xl font-bold text-center mb-1">⚠️ Log a Snag</Text>
            <Text className="text-slate-500 text-center text-sm">Report issues or suggestions</Text>
        </TouchableOpacity>

        <Link href="/(resident)/profile" asChild>
            <TouchableOpacity className="bg-slate-100 rounded-xl p-4 active:bg-slate-200 mt-4">
                <Text className="text-slate-700 font-semibold text-center">My Profile</Text>
            </TouchableOpacity>
        </Link>
      </View>
    </ScreenLayout>
  );
}
