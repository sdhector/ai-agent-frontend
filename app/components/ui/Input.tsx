import React from 'react';
import { TextInput, View, Text } from 'react-native';

interface InputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  multiline?: boolean;
  numberOfLines?: number;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  className?: string;
  editable?: boolean;
}

export function Input({
  value,
  onChangeText,
  placeholder,
  label,
  multiline = false,
  numberOfLines = 1,
  secureTextEntry = false,
  autoCapitalize = 'sentences',
  keyboardType = 'default',
  className = '',
  editable = true,
}: InputProps) {
  return (
    <View className={className}>
      {label && (
        <Text className="mb-2 text-gray-700 font-medium text-sm">
          {label}
        </Text>
      )}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        numberOfLines={numberOfLines}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        editable={editable}
        className={`
          border border-gray-300 rounded-lg px-4 py-3 text-base
          ${multiline ? 'min-h-[100px]' : ''}
          ${!editable ? 'bg-gray-100' : 'bg-white'}
        `}
        placeholderTextColor="#9ca3af"
        style={{ textAlignVertical: multiline ? 'top' : 'center' }}
      />
    </View>
  );
}

