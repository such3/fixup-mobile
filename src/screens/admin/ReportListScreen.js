import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { axiosPrivate } from '../../api/axiosConfig';
import { useToast } from '../../context/ToastContext';

const ReportListScreen = ({ navigation }) => {
    const { showToast } = useToast();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchReports = async () => {
        try {
            const response = await axiosPrivate.get('/reports');
            if (response.data.success) {
                setReports(response.data.data);
            }
        } catch (error) {
            console.error("Fetch reports error", error);
            showToast('error', 'Error', 'Failed to fetch reports');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchReports();
    };

    const handleAction = async (reportId, status) => {
        try {
            await axiosPrivate.patch(`/reports/${reportId}/action`, { status });
            showToast('success', 'Updated', `Report marked as ${status}`);
            fetchReports(); // Refresh list to show new status
        } catch (error) {
            console.error("Report action error", error);
            showToast('error', 'Error', 'Failed to update report');
        }
    };

    const confirmAction = (reportId, status) => {
        Alert.alert(
            `Mark as ${status}?`,
            `Are you sure you want to mark this report as ${status}?`,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Confirm", style: "default", onPress: () => handleAction(reportId, status) }
            ]
        );
    };

    const renderItem = ({ item }) => (
        <View className="bg-white p-4 rounded-xl mb-3 border border-gray-100 shadow-sm opacity-90">
            <View className="flex-row justify-between items-start mb-2">
                <View className="bg-red-50 px-2 py-1 rounded border border-red-100 self-start">
                    <Text className="text-red-700 font-bold text-[10px] uppercase">Reason: {item.reason}</Text>
                </View>
                <View className={`px-2 py-1 rounded ${item.status === 'Reviewed' ? 'bg-green-100' : (item.status === 'Rejected' ? 'bg-gray-200' : 'bg-yellow-100')}`}>
                    <Text className={`text-[10px] font-bold uppercase ${item.status === 'Reviewed' ? 'text-green-700' : (item.status === 'Rejected' ? 'text-gray-600' : 'text-yellow-700')}`}>
                        {item.status || 'Pending'}
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                onPress={() => item.issue && navigation.navigate('ComplaintDetail', { issue: item.issue })}
                disabled={!item.issue}
                className="mb-3"
            >
                <Text className="text-gray-900 font-bold text-base mb-1" numberOfLines={1}>
                    Issue: {item.issue?.title || 'Deleted Issue'}
                </Text>
                <Text className="text-gray-500 text-xs text-right">
                    Reported by: {item.reportedBy?.fullName || 'Unknown'}
                </Text>
            </TouchableOpacity>

            {item.status !== 'Reviewed' && item.status !== 'Rejected' && (
                <View className="flex-row justify-end space-x-3 border-t border-gray-50 pt-3">
                    <TouchableOpacity
                        onPress={() => confirmAction(item._id, 'Rejected')}
                        className="px-3 py-1.5 rounded-lg bg-gray-100"
                    >
                        <Text className="text-gray-600 font-bold text-xs">Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => confirmAction(item._id, 'Reviewed')}
                        className="px-3 py-1.5 rounded-lg bg-blue-600"
                    >
                        <Text className="text-white font-bold text-xs">Mark Reviewed</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" style={{ paddingTop: Platform.OS === 'android' ? 20 : 0 }}>
            <View className="px-5 py-4 bg-white border-b border-gray-100 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-gray-50 rounded-full">
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text className="font-bold text-lg text-gray-900">Flagged Issues</Text>
                <View className="w-10" />
            </View>

            {loading && !refreshing ? (
                <ActivityIndicator size="large" color="#ef4444" className="mt-10" />
            ) : (
                <FlatList
                    data={reports}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ padding: 20 }}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    ListEmptyComponent={<Text className="text-center text-gray-500 mt-10">No flagged issues.</Text>}
                />
            )}
        </SafeAreaView>
    );
};

export default ReportListScreen;
