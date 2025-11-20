import { View, Text, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuth } from '../../ctx';

export default function AdminDashboard() {
  const { signOut } = useAuth();
  
  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-2xl font-bold mb-6">Admin Dashboard</Text>
      
      <Link href="/admin/users" asChild>
        <TouchableOpacity className="bg-gray-100 p-4 rounded-lg mb-4">
          <Text className="text-lg font-semibold">Manage Users</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/admin/estates" asChild>
        <TouchableOpacity className="bg-gray-100 p-4 rounded-lg mb-4">
          <Text className="text-lg font-semibold">Manage Estates</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/change-password" asChild>
        <TouchableOpacity className="bg-gray-100 p-4 rounded-lg mb-4">
          <Text className="text-lg font-semibold">Change Password</Text>
        </TouchableOpacity>
      </Link>

      <TouchableOpacity onPress={signOut} className="bg-red-500 p-4 rounded-lg mt-auto">
        <Text className="text-white text-center font-bold">Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

