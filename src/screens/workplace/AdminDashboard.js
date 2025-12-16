import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AdminDashboard = ({ navigation }) => {
    return (
        <SafeAreaView className="flex-1 bg-gray-50 p-5">
            <View className="mb-8 mt-4">
                <Text className="text-2xl font-bold text-gray-900">Workspace</Text>
                <Text className="text-gray-500 text-sm">Admin tools</Text>
            </View>

            <View className="flex-1 items-center justify-center">
                <Ionicons name="construct-outline" size={48} color="#9ca3af" />
                <Text className="text-gray-500 mt-4 text-center">Admin features are currently disabled.</Text>
            </View>
        </SafeAreaView>
    );
};

export default AdminDashboard;
