import React, { useState, useCallback, useContext, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { axiosPrivate } from '../../api/axiosConfig';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';

// Helper: Status Badge
const StatusBadge = ({ status }) => {
    let bg = 'bg-yellow-100';
    let text = 'text-yellow-700';
    const s = status?.toLowerCase() || '';

    if (s === 'resolved' || s === 'completed') { bg = 'bg-green-100'; text = 'text-green-700'; }
    else if (s === 'in-progress') { bg = 'bg-blue-100'; text = 'text-blue-700'; }

    return (
        <View className={`px-2 py-1 rounded ${bg}`}>
            <Text className={`text-xs font-bold ${text}`}>{status || 'Pending'}</Text>
        </View>
    );
};

const StaffDashboard = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    // Unified view: My Active Tasks + Available Tasks. No 'Completed' tab.
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch Logic
    const fetchIssues = async () => {
        try {
            setLoading(true);
            const response = await axiosPrivate.get('/issues?limit=50');

            let allIssues = response.data.data.issues || response.data.data || [];
            if (!Array.isArray(allIssues)) allIssues = [];

            // Filter Helpers
            const myDept = (user?.department || '').trim().toLowerCase();
            const myId = user?._id;

            const relevantIssues = allIssues.filter(item => {
                const status = (item.status || '').toLowerCase();
                const isCompleted = status === 'completed' || status === 'resolved';

                // Skip completed issues completely
                if (isCompleted) return false;

                // My Active Issues (Assigned to me)
                const itemAssignedId = item.staffAssigned?._id || item.staffAssigned;
                if (itemAssignedId === myId) return true;

                // Available Issues (Unassigned + My Dept)
                const itemDept = (item.department || '').trim().toLowerCase();
                const isMyDept = itemDept === myDept;

                if (!item.staffAssigned && isMyDept) return true;

                return false;
            });

            // Sort: Priority to My Assigned, then Date?
            // Or just Date? Let's stick to Date for now.
            relevantIssues.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

            setIssues(relevantIssues);
        } catch (error) {
            console.error("Fetch error", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Initial Load
    useEffect(() => {
        fetchIssues();
    }, []);

    // Navigation Focus Listener
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchIssues();
        });
        return unsubscribe;
    }, [navigation]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchIssues();
    };

    // Actions
    const handleAssignSelf = async (issueId) => {
        try {
            await axiosPrivate.patch(`/issues/${issueId}/assign`, {
                staffId: user._id
            });
            Alert.alert("Assigned", "You have claimed this issue.");
            fetchIssues();
        } catch (error) {
            Alert.alert("Error", "Could not assign issue.");
        }
    };

    const handleStartWork = async (issueId) => {
        try {
            await axiosPrivate.patch(`/issues/${issueId}/status`, { status: 'in-progress' });
            Alert.alert("Started", "Issue is now In Progress.");
            fetchIssues();
        } catch (error) {
            Alert.alert("Error", "Could not start work.");
        }
    };

    const renderActionButtons = (item) => {
        // No tab check needed, we only show Relevant Active issues

        const status = (item.status || '').toLowerCase();

        // Ensure we check assignment correctly
        const itemAssignedId = item.staffAssigned?._id || item.staffAssigned;
        const isAssignedToMe = itemAssignedId === user?._id;

        // Unassigned -> Assign to Me
        if (!item.staffAssigned) {
            return (
                <TouchableOpacity
                    onPress={() => handleAssignSelf(item._id)}
                    className="bg-gray-900 px-4 py-2 rounded-lg flex-row items-center"
                >
                    <Text className="text-white font-bold text-sm mr-1">Assign to Me</Text>
                    <Ionicons name="person-add" size={16} color="white" />
                </TouchableOpacity>
            );
        }

        // Assigned to Me
        if (isAssignedToMe) {
            if (status === 'pending' || status === 'not started') {
                return (
                    <TouchableOpacity
                        onPress={() => handleStartWork(item._id)}
                        className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
                    >
                        <Text className="text-white font-bold text-sm mr-1">Start Work</Text>
                        <Ionicons name="play" size={16} color="white" />
                    </TouchableOpacity>
                );
            }
            if (status === 'in-progress') {
                return (
                    <TouchableOpacity
                        onPress={() => navigation.navigate('ResolveIssue', { issue: item })}
                        className="bg-green-600 px-4 py-2 rounded-lg flex-row items-center"
                    >
                        <Text className="text-white font-bold text-sm mr-1">Resolve</Text>
                        <Ionicons name="checkmark-circle" size={16} color="white" />
                    </TouchableOpacity>
                );
            }
        }

        return null;
    };

    const renderItem = ({ item }) => (
        <View className="bg-white p-4 mb-3 rounded-2xl shadow-sm border border-gray-100 mx-4">
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-row">
                    <View className="bg-gray-100 px-2 py-1 rounded mr-2">
                        <Text className="font-bold text-[10px] text-gray-500 uppercase">{item.department}</Text>
                    </View>
                    {(item.staffAssigned?._id === user?._id || item.staffAssigned === user?._id) && (
                        <View className="bg-blue-50 px-2 py-1 rounded">
                            <Text className="font-bold text-[10px] text-blue-600 uppercase">My Task</Text>
                        </View>
                    )}
                </View>
                <StatusBadge status={item.status} />
            </View>

            <Text className="text-lg font-bold text-gray-900 mb-1 leading-tight">{item.title}</Text>
            <Text className="text-gray-500 text-sm mb-4" numberOfLines={2}>{item.description}</Text>

            <View className="flex-row justify-between items-center pt-3 border-t border-gray-50">
                <Text className="text-xs text-gray-400 font-medium">
                    {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                {renderActionButtons(item)}
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <View className="px-5 pt-4 pb-2 bg-white">
                <Text className="text-2xl font-bold text-gray-900">Workspace</Text>
                <Text className="text-gray-500 text-sm mb-4">Your tasks & available issues</Text>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            ) : (
                <FlatList
                    data={issues}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ paddingVertical: 16, paddingBottom: 100 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20 px-10">
                            <View className="w-20 h-20 bg-gray-100 rounded-full items-center justify-center mb-4">
                                <Ionicons
                                    name="file-tray-outline"
                                    size={40}
                                    color="#9ca3af"
                                />
                            </View>
                            <Text className="text-gray-900 font-bold text-lg text-center mb-2">
                                All Clear!
                            </Text>
                            <Text className="text-gray-500 text-center text-sm">
                                You have no pending tasks or available issues.
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

export default StaffDashboard;
