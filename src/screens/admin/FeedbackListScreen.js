import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { axiosPrivate } from '../../api/axiosConfig';

const FeedbackListScreen = ({ navigation }) => {
    const [feedbackList, setFeedbackList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchFeedback = async () => {
        try {
            const response = await axiosPrivate.get('/issues/feedback/all');
            if (response.data.success) {
                setFeedbackList(response.data.data);
            }
        } catch (error) {
            console.error("Fetch feedback error", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchFeedback();
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <Ionicons
                key={i}
                name={i < rating ? "star" : "star-outline"}
                size={14}
                color="#f59e0b"
            />
        ));
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('ComplaintDetail', { issue: item })}
            className="bg-white p-5 rounded-2xl mb-3 border border-gray-100 shadow-sm"
        >
            <View className="flex-row justify-between mb-3">
                <View className="flex-row space-x-1">
                    {renderStars(item.feedback?.rating || 0)}
                </View>
                <Text className="text-gray-400 text-xs">
                    {item.feedback?.date ? new Date(item.feedback.date).toLocaleDateString() : 'N/A'}
                </Text>
            </View>

            <Text className="text-gray-800 text-base leading-6 mb-3 font-medium">
                "{item.feedback?.comment}"
            </Text>

            <View className="flex-row items-center border-t border-gray-50 pt-3 mt-1">
                <View className="bg-gray-100 p-2 rounded-full mr-3">
                    <Ionicons name="person" size={12} color="#6b7280" />
                </View>
                <View>
                    <Text className="text-gray-900 font-bold text-xs">{item.issueUploader?.fullName || 'Anonymous'}</Text>
                    <Text className="text-gray-500 text-[10px] uppercase tracking-wide">
                        Regarding: <Text className="font-bold text-gray-700">{item.title}</Text>
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" style={{ paddingTop: Platform.OS === 'android' ? 20 : 0 }}>
            <View className="px-5 py-4 bg-white border-b border-gray-100 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-gray-50 rounded-full">
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text className="font-bold text-lg text-gray-900">Feedback & Reports</Text>
                <View className="w-10" />
            </View>

            {loading && !refreshing ? (
                <ActivityIndicator size="large" color="#2563eb" className="mt-10" />
            ) : (
                <FlatList
                    data={feedbackList}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => item.feedback?._id || index.toString()}
                    contentContainerStyle={{ padding: 20 }}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    ListEmptyComponent={<Text className="text-center text-gray-500 mt-10">No feedback available.</Text>}
                />
            )}
        </SafeAreaView>
    );
};

export default FeedbackListScreen;
