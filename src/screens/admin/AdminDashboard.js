import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const AdminDashboard = ({ navigation }) => {

    const MenuCard = ({ title, icon, color, description, route }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate(route)}
            activeOpacity={0.9}
            className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 mb-4"
        >
            <View className="flex-row items-center mb-3">
                <View className={`p-3 rounded-2xl ${color} mr-4`}>
                    <Ionicons name={icon} size={24} color="white" />
                </View>
                <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-900">{title}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#d1d5db" />
            </View>
            <Text className="text-gray-500 font-medium leading-5">{description}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" style={{ paddingTop: Platform.OS === 'android' ? 20 : 0 }}>
            <ScrollView className="flex-1 px-5 pt-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

                <View className="mb-8">
                    <Text className="text-gray-500 font-bold uppercase tracking-wider text-xs mb-1">Admin Console</Text>
                    <Text className="text-3xl font-extrabold text-gray-900">Dashboard</Text>
                </View>

                <MenuCard
                    title="Analytics Overview"
                    icon="bar-chart"
                    color="bg-indigo-600"
                    description="Visual insights on performance, trends, and resolution times."
                    route="Analytics"
                />

                <MenuCard
                    title="User Management"
                    icon="people"
                    color="bg-blue-600"
                    description="Manage users, view performance stats, and handle staff assignments."
                    route="UserManagement"
                />

                <MenuCard
                    title="Issue Management"
                    icon="list"
                    color="bg-purple-600"
                    description="Oversee all reported issues, update details, and track resolution progress."
                    route="AdminIssueList"
                />

                <MenuCard
                    title="Feedback"
                    icon="star"
                    color="bg-orange-500"
                    description="View student feedback and ratings."
                    route="FeedbackList"
                />

                <MenuCard
                    title="Flagged Reports"
                    icon="flag"
                    color="bg-red-500"
                    description="Review and take action on reported issues."
                    route="ReportList"
                />

                {/* Additional stats or summary widgets could go here */}

            </ScrollView>
        </SafeAreaView>
    );
};

export default AdminDashboard;
