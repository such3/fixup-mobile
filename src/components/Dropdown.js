import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Dropdown = ({ label, items, selectedValue, onValueChange, placeholder }) => {
    const [visible, setVisible] = useState(false);

    const handleSelect = (item) => {
        onValueChange(item);
        setVisible(false);
    };

    const selectedLabel = items.find(i => i.value === selectedValue?.value)?.label || placeholder;

    return (
        <View>
            <Text className="text-gray-700 font-bold mb-2 ml-1 text-xs uppercase tracking-wider">{label}</Text>
            <TouchableOpacity
                onPress={() => setVisible(true)}
                className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 flex-row justify-between items-center"
            >
                <Text className={`text-base font-medium ${selectedValue ? 'text-gray-900' : 'text-gray-400'}`}>
                    {selectedValue ? selectedValue.label : placeholder}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#6b7280" />
            </TouchableOpacity>

            <Modal visible={visible} transparent animationType="slide">
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl max-h-[50%]">
                        <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
                            <Text className="text-lg font-bold text-gray-900">Select {label}</Text>
                            <TouchableOpacity onPress={() => setVisible(false)} className="p-2">
                                <Ionicons name="close" size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={items}
                            keyExtractor={item => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => handleSelect(item)}
                                    className={`p-4 border-b border-gray-50 active:bg-blue-50 flex-row justify-between items-center`}
                                >
                                    <Text className={`text-base ${selectedValue?.value === item.value ? 'text-primary font-bold' : 'text-gray-700'}`}>
                                        {item.label}
                                    </Text>
                                    {selectedValue?.value === item.value && (
                                        <Ionicons name="checkmark" size={20} color="#2563eb" />
                                    )}
                                </TouchableOpacity>
                            )}
                            className="mb-8"
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default Dropdown;
