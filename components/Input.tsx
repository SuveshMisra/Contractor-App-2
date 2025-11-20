import { View, Text, TextInput as RNTextInput, TextInputProps as RNTextInputProps } from 'react-native';

interface InputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export function Input({ label, error, containerClassName = '', className = '', ...props }: InputProps) {
  return (
    <View className={`mb-4 ${containerClassName}`}>
      {label && <Text className="text-sm font-medium text-slate-700 mb-1.5">{label}</Text>}
      <RNTextInput
        className={`w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : ''} ${className}`}
        placeholderTextColor="#94a3b8"
        {...props}
      />
      {error && <Text className="text-xs text-red-500 mt-1">{error}</Text>}
    </View>
  );
}

