import { Text, TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  loading?: boolean;
  className?: string;
  textClassName?: string;
}

export function Button({ 
  title, 
  variant = 'primary', 
  loading = false, 
  className = '', 
  textClassName = '',
  disabled,
  ...props 
}: ButtonProps) {
  
  const baseStyles = "px-4 py-3 rounded-lg flex-row justify-center items-center";
  
  const variants = {
    primary: "bg-blue-600 active:bg-blue-700",
    secondary: "bg-slate-800 active:bg-slate-900",
    danger: "bg-red-600 active:bg-red-700",
    outline: "bg-transparent border border-slate-300 active:bg-slate-50",
    ghost: "bg-transparent active:bg-slate-100"
  };

  const textVariants = {
    primary: "text-white font-semibold",
    secondary: "text-white font-semibold",
    danger: "text-white font-semibold",
    outline: "text-slate-700 font-semibold",
    ghost: "text-slate-600 font-medium"
  };

  const disabledStyles = "opacity-50";

  return (
    <TouchableOpacity 
      className={`${baseStyles} ${variants[variant]} ${disabled || loading ? disabledStyles : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#334155' : 'white'} />
      ) : (
        <Text className={`${textVariants[variant]} text-center ${textClassName}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

