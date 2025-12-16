import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const ProjectInfoScreen = ({ navigation }) => {
    const teamMembers = [
        { name: 'FixUp Team', role: 'Development & Design', avatar: null },
        // Add specific members if known, otherwise generic
    ];

    const openLink = (url) => {
        Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="px-4 py-3 flex-row items-center border-b border-gray-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-gray-50 rounded-full mr-3">
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">About FixUp</Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 50 }}>

                {/* Project Logo/Banner */}
                <View className="items-center mb-8">
                    <View className="w-24 h-24 bg-primary rounded-3xl justify-center items-center mb-4 shadow-lg shadow-blue-200">
                        <Text className="text-white text-5xl font-bold">F</Text>
                    </View>
                    <Text className="text-3xl font-extrabold text-gray-900">FixUp</Text>
                    <Text className="text-gray-500 font-medium mt-1">Community Issue Tracker</Text>
                </View>

                {/* Description */}
                <View className="mb-8">
                    <Text className="text-lg font-bold text-gray-900 mb-3">The Project</Text>
                    <Text className="text-gray-600 leading-6">
                        FixUp is a comprehensive solution designed to streamline maintenance and issue reporting within campus environments.
                        By bridging the gap between students, staff, and administration, we ensure that every concern is heard, tracked, and resolved efficiently.
                    </Text>
                    <View className="mt-4 flex-row flex-wrap gap-2">
                        <View className="bg-blue-50 px-3 py-1 rounded-full"><Text className="text-blue-600 text-xs font-bold">Real-time Tracking</Text></View>
                        <View className="bg-purple-50 px-3 py-1 rounded-full"><Text className="text-purple-600 text-xs font-bold">Gamified Leaderboard</Text></View>
                        <View className="bg-green-50 px-3 py-1 rounded-full"><Text className="text-green-600 text-xs font-bold">Transparent Reporting</Text></View>
                    </View>
                </View>

                {/* Team Section */}
                <View className="mb-8">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Meet the Team</Text>

                    {/* Placeholder for Team Members */}
                    <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-3 flex-row items-center">
                        <View className="w-12 h-12 bg-indigo-100 rounded-full items-center justify-center mr-4">
                            <Ionicons name="code-slash" size={20} color="#4f46e5" />
                        </View>
                        <View>
                            <Text className="font-bold text-gray-900 text-base">Development Team</Text>
                            <Text className="text-gray-500 text-xs">Full Stack Engineering</Text>
                        </View>
                    </View>

                    <View className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-3 flex-row items-center">
                        <View className="w-12 h-12 bg-pink-100 rounded-full items-center justify-center mr-4">
                            <Ionicons name="brush" size={20} color="#db2777" />
                        </View>
                        <View>
                            <Text className="font-bold text-gray-900 text-base">Design Team</Text>
                            <Text className="text-gray-500 text-xs">UI/UX & Prototyping</Text>
                        </View>
                    </View>

                </View>

                {/* Contact / Socials */}
                <View>
                    <Text className="text-lg font-bold text-gray-900 mb-4">Contact Us</Text>
                    <TouchableOpacity onPress={() => openLink('mailto:support@fixup.com')} className="flex-row items-center mb-3">
                        <Ionicons name="mail-outline" size={20} color="#6b7280" />
                        <Text className="text-gray-600 ml-3 text-base">support@fixup.com</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => openLink('https://github.com')} className="flex-row items-center">
                        <Ionicons name="logo-github" size={20} color="#6b7280" />
                        <Text className="text-gray-600 ml-3 text-base">View on GitHub</Text>
                    </TouchableOpacity>
                </View>

                {/* Version */}
                <Text className="text-center text-gray-400 text-xs mt-12">Version 1.0.0 (Beta)</Text>

            </ScrollView>
        </SafeAreaView>
    );
};

export default ProjectInfoScreen;
