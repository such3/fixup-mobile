import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, ActionSheetIOS, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { axiosPrivate } from '../../api/axiosConfig';
import { useFocusEffect } from '@react-navigation/native';

const STATUS_FILTERS = ['All', 'Not Started', 'In Progress', 'Resolved', 'Completed'];
// const DEPARTMENTS = ['All', 'Electricity', 'Water', 'Furniture', 'Civil', 'Internet', 'Others']; // Example

const AdminIssueListScreen = ({ navigation }) => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchIssues = async (pageNum = 1, searchQuery = '', status = 'All', shouldRefresh = false) => {
        if (loading && !shouldRefresh) return; // Prevent double fetch unless refresh
        setLoading(true);

        try {
            const params = {
                page: pageNum,
                limit: 10,
                search: searchQuery,
            };
            if (status !== 'All') params.status = status;

            const response = await axiosPrivate.get('/issues', { params });
            if (response.data.success) {
                const newIssues = response.data.data.issues;
                if (shouldRefresh) {
                    setIssues(newIssues);
                } else {
                    setIssues(prev => [...prev, ...newIssues]);
                }
                setHasMore(newIssues.length === 10);
            }
        } catch (error) {
            console.error("Fetch issues error", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Initial Fetch & Refetch on Focus (so back navigation updates state)
    useFocusEffect(
        React.useCallback(() => {
            // Optional: Auto-refresh list when returning? 
            // Might be heavy if list is long. Let's just rely on Pull-to-Refresh or manual state updates.
            // Actually, admin wants robust. Let's refresh silently or just load first page if empty.
            if (issues.length === 0) fetchIssues(1, search, statusFilter, true);
        }, [])
    );

    // Debounce Search & Filter Change
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchIssues(1, search, statusFilter, true);
        }, 500);
        return () => clearTimeout(timer);
    }, [search, statusFilter]);

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchIssues(nextPage, search, statusFilter);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        setPage(1);
        fetchIssues(1, search, statusFilter, true);
    };

    const StatusBadge = ({ status }) => {
        let bg = 'bg-gray-100';
        let text = 'text-gray-600';
        const s = status?.toLowerCase() || '';

        if (s.includes('resolved') || s.includes('completed')) { bg = 'bg-green-100'; text = 'text-green-700'; }
        else if (s.includes('progress')) { bg = 'bg-blue-100'; text = 'text-blue-700'; }
        else if (s.includes('not started')) { bg = 'bg-yellow-100'; text = 'text-yellow-700'; }

        return (
            <View className={`px-2 py-1 rounded-md ${bg} self-start`}>
                <Text className={`text-[10px] font-bold uppercase ${text}`}>{status}</Text>
            </View>
        );
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('ComplaintDetail', { issue: item })}
            className="bg-white p-4 rounded-xl mb-3 border border-gray-100 shadow-sm"
        >
            <View className="flex-row justify-between mb-2">
                <StatusBadge status={item.status} />
                <Text className="text-gray-400 text-xs">{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            <Text className="text-gray-900 font-bold text-base mb-1" numberOfLines={1}>{item.title}</Text>
            <Text className="text-gray-500 text-sm mb-3" numberOfLines={2}>{item.description}</Text>

            <View className="flex-row items-center justify-between border-t border-gray-50 pt-3">
                <View className="flex-row items-center">
                    <Ionicons name="location-outline" size={14} color="#6b7280" />
                    <Text className="text-gray-500 text-xs ml-1">{item.location || 'N/A'}</Text>
                </View>
                <View className="flex-row items-center bg-gray-50 px-2 py-1 rounded">
                    <Ionicons name="person-outline" size={12} color="#6b7280" />
                    <Text className="text-gray-600 text-xs ml-1 font-medium">
                        {item.staffAssigned?.fullName || 'Unassigned'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" style={{ paddingTop: Platform.OS === 'android' ? 20 : 0 }}>
            {/* Header */}
            <View className="px-5 py-4 bg-white border-b border-gray-100 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-gray-50 rounded-full">
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text className="font-bold text-lg text-gray-900">Issue Management</Text>
                <View className="w-10" />
            </View>

            {/* Filters */}
            <View className="bg-white px-5 py-3 border-b border-gray-100">
                {/* Search */}
                <View className="bg-gray-100 rounded-xl px-4 py-3 flex-row items-center mb-3">
                    <Ionicons name="search" size={20} color="#9ca3af" />
                    <TextInput
                        className="flex-1 ml-3 text-base text-gray-900"
                        placeholder="Search issues, location..."
                        placeholderTextColor="#9ca3af"
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                {/* Horizontal Status Filter Scroller */}
                <FlatList
                    horizontal
                    data={STATUS_FILTERS}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => setStatusFilter(item)}
                            className={`px-4 py-2 rounded-full mr-2 border ${statusFilter === item ? 'bg-black border-black' : 'bg-white border-gray-200'}`}
                        >
                            <Text className={`text-xs font-bold ${statusFilter === item ? 'text-white' : 'text-gray-600'}`}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <FlatList
                data={issues}
                renderItem={renderItem}
                keyExtractor={item => item._id}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                ListFooterComponent={loading && !refreshing ? <ActivityIndicator size="small" color="#000" className="mt-4" /> : null}
                ListEmptyComponent={!loading && <Text className="text-center text-gray-500 mt-10">No issues found matching criteria.</Text>}
            />
        </SafeAreaView>
    );
};

export default AdminIssueListScreen;
