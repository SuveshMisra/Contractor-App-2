import { View, Text, TouchableOpacity, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
  variant?: 'default' | 'flat';
}

export function Card({ children, onPress, className = '', variant = 'default', ...props }: CardProps) {
  const baseStyles = "rounded-xl p-4";
  const variantStyles = {
    default: "bg-white shadow-sm border border-slate-200",
    flat: "bg-slate-50 border border-slate-100"
  };

  const content = (
    <View className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

