import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}

export function Button({
  onPress,
  title,
  disabled = false,
  loading = false,
  variant = 'primary',
  className = '',
}: ButtonProps) {
  const baseClasses = 'px-4 py-3 rounded-lg flex-row items-center justify-center';

  const variantClasses = {
    primary: 'bg-primary-500',
    secondary: 'bg-gray-500',
    outline: 'bg-transparent border-2 border-primary-500',
  };

  const textClasses = {
    primary: 'text-white font-semibold text-base',
    secondary: 'text-white font-semibold text-base',
    outline: 'text-primary-500 font-semibold text-base',
  };

  const disabledClass = disabled || loading ? 'opacity-50' : '';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClass} ${className}`}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? '#0284c7' : '#ffffff'}
          size="small"
        />
      ) : (
        <Text className={textClasses[variant]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

