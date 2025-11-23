import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({ onSend, disabled, placeholder = 'Type a message...' }: MessageInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage('');
    }
  };

  // Handle key press for web (Enter to send, Shift+Enter for new line)
  const handleKeyPress = (e: any) => {
    if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View className="flex-row items-end p-4 bg-white border-t border-gray-200">
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          multiline
          maxLength={4000}
          editable={!disabled}
          className={`
            flex-1 max-h-32 px-4 py-3 mr-2 bg-gray-50 rounded-lg text-base
            ${disabled ? 'opacity-50' : ''}
          `}
          style={{ textAlignVertical: 'top' }}
          onSubmitEditing={handleSend}
          onKeyPress={handleKeyPress}
        />

        <TouchableOpacity
          onPress={handleSend}
          disabled={!message.trim() || disabled}
          className={`
            w-12 h-12 rounded-full items-center justify-center
            ${message.trim() && !disabled ? 'bg-primary-500' : 'bg-gray-300'}
          `}
          activeOpacity={0.7}
        >
          <Ionicons
            name="send"
            size={20}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

