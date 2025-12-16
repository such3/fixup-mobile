import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';

const DashboardScreen = () => {
    const { logout, user } = useContext(AuthContext);

    return (
        <SafeAreaView className="flex-1 bg-background p-4">
            <View className="flex-row justify-between items-center mb-6 mt-4">
                <Text className="text-2xl font-bold text-primary">Dashboard</Text>
                <TouchableOpacity onPress={logout} className="bg-red-50 px-3 py-1 rounded-full border border-red-100">
                    <Text className="text-red-500 font-medium">Logout</Text>
                </TouchableOpacity>
            </View>

            <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <Text className="text-gray-500 mb-1">Hello,</Text>
                <Text className="text-xl font-bold text-gray-900">{user?.name || 'User'}</Text>
                <Text className="text-gray-400 text-sm mt-1">{user?.email}</Text>
            </View>

            <View className="bg-blue-50 p-6 rounded-2xl border border-blue-100">
                <Text className="text-primary font-bold text-lg mb-2">Active Complaints</Text>
                <Text className="text-3xl font-extrabold text-blue-900">0</Text>
            </View>
        </SafeAreaView>
    );
};

export default DashboardScreen;
