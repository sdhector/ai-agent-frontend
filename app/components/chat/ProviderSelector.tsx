import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AI_MODELS, DEFAULT_MODEL } from '../../services/constants';

interface ProviderSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

export function ProviderSelector({ selectedModel, onModelChange, disabled }: ProviderSelectorProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const currentModel = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0];

  const handleSelectModel = (modelId: string) => {
    onModelChange(modelId);
    setModalVisible(false);
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        disabled={disabled}
        className={`
          flex-row items-center px-3 py-2 bg-gray-100 rounded-lg
          ${disabled ? 'opacity-50' : ''}
        `}
        activeOpacity={0.7}
      >
        <Text className="text-sm font-medium text-gray-700 mr-2">
          {currentModel.name}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#374151" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity
            className="bg-white rounded-lg w-11/12 max-w-md"
            activeOpacity={1}
          >
            <View className="p-4 border-b border-gray-200">
              <Text className="text-lg font-semibold text-gray-900">
                Select Model
              </Text>
            </View>

            <ScrollView className="max-h-96">
              {AI_MODELS.map((model) => (
                <TouchableOpacity
                  key={model.id}
                  onPress={() => handleSelectModel(model.id)}
                  className={`
                    p-4 border-b border-gray-100
                    ${model.id === selectedModel ? 'bg-primary-50' : ''}
                  `}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className="text-base font-medium text-gray-900">
                        {model.name}
                      </Text>
                      <Text className="text-sm text-gray-500 mt-1">
                        Provider: {model.provider}
                      </Text>
                    </View>

                    {model.id === selectedModel && (
                      <Ionicons name="checkmark-circle" size={24} color="#0284c7" />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="p-4 border-t border-gray-200"
              activeOpacity={0.7}
            >
              <Text className="text-center text-base font-medium text-primary-500">
                Cancel
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

