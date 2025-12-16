import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, Alert, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { axiosPrivate } from '../../api/axiosConfig';
import { useToast } from '../../context/ToastContext';

const UserManagementScreen = ({ navigation }) => {
    const { showToast } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Stats Modal State
    const [selectedUser, setSelectedUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [isStatsVisible, setIsStatsVisible] = useState(false);

    const fetchUsers = async (pageNum = 1, searchQuery = '', shouldRefresh = false) => {
        if (loading) return;
        setLoading(true);
        try {
            const response = await axiosPrivate.get(`/users`, {
                params: { page: pageNum, limit: 10, search: searchQuery }
            });

            if (response.data.success) {
                const newUsers = response.data.data.users;
                if (shouldRefresh) {
                    setUsers(newUsers);
                } else {
                    setUsers(prev => [...prev, ...newUsers]);
                }

                setHasMore(newUsers.length === 10);
            }
        } catch (error) {
            console.error("Fetch users error", error);
            showToast('error', 'Error', 'Failed to fetch users');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(1);
            fetchUsers(1, search, true);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchUsers(nextPage, search);
        }
    };

    const handleRefresh = () => {
        setRefreshing(true);
        setPage(1);
        fetchUsers(1, search, true);
    };

    const handleDeleteUser = (user) => {
        Alert.alert(
            "Delete User",
            `Are you sure you want to delete ${user.fullName}? This action cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await axiosPrivate.delete(`/users/${user._id}`);
                            showToast('success', 'Deleted', `${user.fullName} has been removed.`);
                            handleRefresh();
                        } catch (error) {
                            console.error("Delete error", error);
                            showToast('error', 'Error', 'Failed to delete user');
                        }
                    }
                }
            ]
        );
    };

    const handleViewStats = async (user) => {
        setSelectedUser(user);
        setIsStatsVisible(true);
        setStatsLoading(true);
        setStats(null);
        try {
            const response = await axiosPrivate.get(`/users/${user._id}/stats`);
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error("Stats error", error);
            showToast('error', 'Error', 'Failed to fetch user stats');
            setIsStatsVisible(false);
        } finally {
            setStatsLoading(false);
        }
    };

    const renderUserItem = ({ item }) => (
        <View className="bg-white p-4 rounded-2xl mb-3 border border-gray-100 shadow-sm flex-row items-center justify-between">
            <View className="flex-1 mr-3">
                <Text className="text-gray-900 font-bold text-lg" numberOfLines={1}>{item.fullName}</Text>
                <Text className="text-gray-500 text-sm mb-1">{item.email}</Text>
                <View className="flex-row">
                    <View className={`px-2 py-0.5 rounded-md ${item.role === 'admin' ? 'bg-purple-100' : (item.role === 'staff' ? 'bg-blue-100' : 'bg-gray-100')}`}>
                        <Text className={`text-xs font-bold uppercase ${item.role === 'admin' ? 'text-purple-700' : (item.role === 'staff' ? 'text-blue-700' : 'text-gray-600')}`}>
                            {item.role}
                        </Text>
                    </View>
                    {item.deptUnder && (
                        <View className="bg-orange-50 px-2 py-0.5 rounded-md ml-2 border border-orange-100">
                            <Text className="text-orange-700 text-xs font-bold uppercase">{item.deptUnder}</Text>
                        </View>
                    )}
                </View>
            </View>

            <View className="flex-row items-center">
                <TouchableOpacity
                    onPress={() => navigation.navigate('EditUser', { user: item })}
                    className="p-2 bg-gray-100 rounded-full mr-2"
                >
                    <Ionicons name="pencil" size={20} color="#4b5563" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleViewStats(item)}
                    className="p-2 bg-blue-50 rounded-full mr-2"
                >
                    <Ionicons name="stats-chart" size={20} color="#2563eb" />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleDeleteUser(item)}
                    className="p-2 bg-red-50 rounded-full"
                >
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" style={{ paddingTop: Platform.OS === 'android' ? 20 : 0 }}>
            {/* Header */}
            <View className="px-5 py-4 bg-white border-b border-gray-100 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-gray-50 rounded-full">
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text className="font-bold text-lg text-gray-900">User Management</Text>
                <TouchableOpacity onPress={() => navigation.navigate('CreateUser')} className="p-2 bg-blue-600 rounded-full shadow-sm">
                    <Ionicons name="add" size={24} color="white" />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View className="px-5 py-3 bg-white border-b border-gray-100">
                <View className="bg-gray-100 rounded-xl px-4 py-3 flex-row items-center">
                    <Ionicons name="search" size={20} color="#9ca3af" />
                    <TextInput
                        className="flex-1 ml-3 text-base text-gray-900"
                        placeholder="Search by name or email..."
                        placeholderTextColor="#9ca3af"
                        value={search}
                        onChangeText={setSearch}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Ionicons name="close-circle" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <FlatList
                data={users}
                renderItem={renderUserItem}
                keyExtractor={item => item._id}
                contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                ListFooterComponent={loading && !refreshing ? <ActivityIndicator size="small" color="#2563eb" className="mt-4" /> : null}
                ListEmptyComponent={!loading && <Text className="text-center text-gray-500 mt-10">No users found.</Text>}
            />

            {/* Stats Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isStatsVisible}
                onRequestClose={() => setIsStatsVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6 min-h-[50%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <View>
                                <Text className="text-xl font-bold text-gray-900">Performance Stats</Text>
                                <Text className="text-gray-500">{selectedUser?.fullName}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setIsStatsVisible(false)} className="p-2 bg-gray-100 rounded-full">
                                <Ionicons name="close" size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>

                        {statsLoading ? (
                            <ActivityIndicator size="large" color="#2563eb" className="py-10" />
                        ) : stats ? (
                            <View className="space-y-4">
                                <View className="flex-row justify-between">
                                    <View className="w-[48%] bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                        <Text className="text-3xl font-extrabold text-blue-600">{stats.assignedCount}</Text>
                                        <Text className="text-blue-800 font-bold text-xs uppercase mt-1">Assigned</Text>
                                    </View>
                                    <View className="w-[48%] bg-green-50 p-4 rounded-2xl border border-green-100">
                                        <Text className="text-3xl font-extrabold text-green-600">{stats.resolvedCount}</Text>
                                        <Text className="text-green-800 font-bold text-xs uppercase mt-1">Resolved</Text>
                                    </View>
                                </View>

                                <View className="flex-row justify-between">
                                    <View className="w-[48%] bg-orange-50 p-4 rounded-2xl border border-orange-100">
                                        <Text className="text-3xl font-extrabold text-orange-600">{stats.reportedCount}</Text>
                                        <Text className="text-orange-800 font-bold text-xs uppercase mt-1">Reported</Text>
                                    </View>
                                    <View className="w-[48%] bg-purple-50 p-4 rounded-2xl border border-purple-100">
                                        <Text className="text-3xl font-extrabold text-purple-600">{stats.avgRating} <Text className="text-base">★</Text></Text>
                                        <Text className="text-purple-800 font-bold text-xs uppercase mt-1">Avg Rating</Text>
                                    </View>
                                </View>

                                <View className="bg-gray-50 p-4 rounded-2xl mt-4">
                                    <Text className="text-gray-500 text-sm text-center">
                                        Stats are calculated based on all time activity.
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <Text className="text-center text-gray-500 mt-10">No statistics available.</Text>
                        )}
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
};

export default UserManagementScreen;
