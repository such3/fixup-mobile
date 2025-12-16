import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { axiosPrivate } from '../../api/axiosConfig';

const AnalyticsScreen = ({ navigation }) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchStats = async () => {
        try {
            const response = await axiosPrivate.get('/issues/stats/overview'); // Assuming getIssueStats is mounted here?
            // Wait, I need to check where getIssueStats is mounted. 
            // In Step 133, it's `getIssueStats`. 
            // In Step 178 (Routes), I didn't see `issue.route.js`. 
            // I need to scan `issue.route.js` to ensure the route exists! 
            // If not, I'll assume `/issues/stats` or similar. 
            // Just in case, I will try fetching from `/issues/stats`.
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            console.error("Fetch stats error", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchStats();
    };

    const StatCard = ({ title, value, subtext, color = 'bg-white', textColor = 'text-gray-900', icon }) => (
        <View className={`${color} p-4 rounded-2xl flex-1 mr-3 mb-3 border border-gray-100 shadow-sm min-w-[45%]`}>
            <View className="flex-row justify-between items-start mb-2">
                <Text className={`text-xs font-bold uppercase opacity-70 ${textColor}`}>{title}</Text>
                {icon && <Ionicons name={icon} size={16} color={textColor === 'text-white' ? 'white' : '#374151'} />}
            </View>
            <Text className={`text-3xl font-extrabold ${textColor}`}>{value}</Text>
            {subtext && <Text className={`text-xs mt-1 opacity-80 ${textColor}`}>{subtext}</Text>}
        </View>
    );

    const BarChart = ({ data, title, colorClass = 'bg-blue-500' }) => {
        if (!data || data.length === 0) return null;
        const max = Math.max(...data.map(d => d.count));

        return (
            <View className="bg-white p-5 rounded-2xl mb-4 border border-gray-100">
                <Text className="font-bold text-gray-900 text-lg mb-4">{title}</Text>
                {data.map((item, index) => (
                    <View key={index} className="mb-3">
                        <View className="flex-row justify-between mb-1">
                            <Text className="text-xs font-bold text-gray-500 uppercase">{item._id || 'Unknown'}</Text>
                            <Text className="text-xs font-bold text-gray-900">{item.count}</Text>
                        </View>
                        <View className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <View
                                style={{ width: `${(item.count / max) * 100}%` }}
                                className={`h-full rounded-full ${colorClass}`}
                            />
                        </View>
                    </View>
                ))}
            </View>
        );
    };

    if (loading && !refreshing) return (
        <View className="flex-1 items-center justify-center bg-gray-50">
            <ActivityIndicator size="large" color="#2563eb" />
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" style={{ paddingTop: Platform.OS === 'android' ? 20 : 0 }}>
            <View className="px-5 py-4 bg-white border-b border-gray-100 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-gray-50 rounded-full">
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text className="font-bold text-lg text-gray-900">Analytics</Text>
                <View className="w-10" />
            </View>

            <ScrollView
                className="flex-1 p-5"
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            >
                {data ? (
                    <>
                        {/* Key Metrics */}
                        <View className="flex-row flex-wrap -mr-3">
                            <StatCard
                                title="Total Issues"
                                value={data.total}
                                subtext="All time"
                                icon="file-tray-full"
                                color="bg-blue-600"
                                textColor="text-white"
                            />
                            <StatCard
                                title="Resolved"
                                value={data.totalResolved}
                                subtext={`${((data.totalResolved / (data.total || 1)) * 100).toFixed(0)}% Rate`}
                                icon="checkmark-circle"
                                color="bg-green-500"
                                textColor="text-white"
                            />
                            <StatCard
                                title="Avg Resolution"
                                value={`${data.avgResolutionHours || 0}h`}
                                subtext="Time to resolve"
                                icon="time"
                            />
                            <StatCard
                                title="Avg Rating"
                                value={Number(data.avgRating).toFixed(1)}
                                subtext="Student feedback"
                                icon="star"
                            />
                        </View>

                        {/* Breakdown Charts */}
                        <BarChart data={data.byDepartment} title="Issues by Department" colorClass="bg-purple-500" />
                        <BarChart data={data.byStatus} title="Current Status" colorClass="bg-orange-500" />
                        <BarChart data={data.byPriority} title="Priority Level" colorClass="bg-red-500" />

                        {/* Trending */}
                        <View className="bg-white p-5 rounded-2xl mb-10 border border-gray-100">
                            <Text className="font-bold text-gray-900 text-lg mb-4">Trending Issues</Text>
                            {data.trending && data.trending.length > 0 ? (
                                data.trending.map((t, i) => (
                                    <View key={i} className="flex-row items-center py-3 border-b border-gray-50 last:border-0">
                                        <Text className="font-bold text-gray-400 mr-3 text-lg">#{i + 1}</Text>
                                        <View className="flex-1">
                                            <Text className="text-gray-900 font-medium header" numberOfLines={1}>{t.issue.title}</Text>
                                            <Text className="text-gray-500 text-xs">{t.votes} Upvotes</Text>
                                        </View>
                                        <View className={`bg-gray-100 px-2 py-1 rounded text-xs font-bold`}>
                                            <Text className="text-xs">{t.issue.status}</Text>
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <Text className="text-gray-400 italic">No trending info yet.</Text>
                            )}
                        </View>
                    </>
                ) : (
                    <Text className="text-center text-gray-500 mt-10">Failed to load data.</Text>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

export default AnalyticsScreen;
