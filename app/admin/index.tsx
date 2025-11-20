import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../ctx';
import { ScreenLayout } from '../../components/ScreenLayout';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';

export default function AdminDashboard() {
  const { signOut } = useAuth();
  
  const menuItems = [
      { title: 'Manage Users', href: '/admin/users', description: 'View and edit user roles and assignments' },
      { title: 'Manage Estates', href: '/admin/estates', description: 'Add or remove estates' },
      { title: 'Change Password', href: '/change-password', description: 'Update your login password' },
  ];

  return (
    <ScreenLayout>
      <View className="mb-6">
        <Text className="text-3xl font-bold text-slate-900">Admin Dashboard</Text>
        <Text className="text-slate-500 mt-1">Welcome back, Admin.</Text>
      </View>
      
      <View className="gap-4">
        {menuItems.map((item) => (
            <Link key={item.href} href={item.href as any} asChild>
                <TouchableOpacity>
                    <Card className="flex-row items-center justify-between active:bg-slate-50">
                        <View>
                            <Text className="text-lg font-semibold text-slate-800">{item.title}</Text>
                            <Text className="text-slate-500 text-sm mt-1">{item.description}</Text>
                        </View>
                        <Text className="text-slate-400 text-xl">›</Text>
                    </Card>
                </TouchableOpacity>
            </Link>
        ))}
      </View>

      <View className="mt-8 border-t border-slate-200 pt-6">
        <Button 
            title="Sign Out" 
            onPress={signOut} 
            variant="danger"
            className="w-full sm:w-auto self-start"
        />
      </View>
    </ScreenLayout>
  );
}
