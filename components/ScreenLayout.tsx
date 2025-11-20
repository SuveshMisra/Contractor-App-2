import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenLayoutProps {
  children: React.ReactNode;
  className?: string;
  scroll?: boolean;
}

export function ScreenLayout({ children, className = '', scroll = true }: ScreenLayoutProps) {
  const content = (
    <View className={`flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${className}`}>
      {children}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50" edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView className="flex-1" contentContainerClassName="flex-grow">
           {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

