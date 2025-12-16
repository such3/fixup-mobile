import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { axiosPrivate } from '../../api/axiosConfig';
import { useToast } from '../../context/ToastContext';
import { AuthContext } from '../../context/AuthContext';
import { DEPARTMENTS } from '../../constants/departments';

const AssignStaffScreen = ({ route, navigation }) => {
    const { issue } = route.params;
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { showToast } = useToast();
    const { user } = useContext(AuthContext);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            // Fetch users ONLY from the issue's department
            const response = await axiosPrivate.get(`/users/staff?dept=${issue.department}`);
            console.log("Fetch Staff Response:", JSON.stringify(response.data, null, 2));
            const responseData = response.data;

            if (responseData.success) {
                // Endpoint returns array in data directly
                let staffs = Array.isArray(responseData.data) ? responseData.data : [];
                console.log("Parsed Staffs:", staffs.length);

                setStaffList(staffs);
            }
        } catch (error) {
            console.error("Fetch staff error", error);
            showToast("error", "Error", "Failed to fetch staff list");
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async (staffId, staffName) => {
        Alert.alert(
            "Confirm Assignment",
            `Assign issue to ${staffName}?`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Assign",
                    onPress: async () => {
                        try {
                            await axiosPrivate.patch(`/issues/${issue._id}/assign`, {
                                staffId: staffId
                            });
                            showToast("success", "Assigned", `${staffName} has been assigned.`);
                            navigation.goBack();
                        } catch (error) {
                            console.error("Assign error", error);
                            showToast("error", "Failed", "Could not assign staff.");
                        }
                    }
                }
            ]
        );
    };

    const filteredStaff = staffList.filter(s => {
        const matchesSearch = s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
    });

    const renderItem = ({ item }) => {
        const isAssigned = issue.staffAssigned?._id === item._id || issue.staffAssigned === item._id;

        return (
            <View className={`p-4 rounded-xl mb-3 border ${isAssigned ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'}`}>
                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        <View className="bg-gray-200 p-3 rounded-full mr-3">
                            <Ionicons name="person" size={20} color="#4b5563" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-bold text-gray-900 text-base">{item.fullName}</Text>
                            <Text className="text-gray-500 text-sm">{item.deptUnder || 'No Dept'}</Text>
                            <Text className="text-gray-400 text-xs">{item.email}</Text>
                        </View>
                    </View>

                    {isAssigned ? (
                        <View className="bg-blue-100 px-3 py-1 rounded-full">
                            <Text className="text-blue-700 font-bold text-xs">Assigned</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            onPress={() => handleAssign(item._id, item.fullName)}
                            className="bg-black px-4 py-2 rounded-lg"
                        >
                            <Text className="text-white font-bold text-sm">Assign</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: Platform.OS === 'android' ? 20 : 0 }}>
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-gray-50 rounded-full mr-3">
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </TouchableOpacity>
                <View>
                    <Text className="font-bold text-xl text-gray-900">Assign Staff</Text>
                    <Text className="text-gray-500 text-xs">For: {issue.title}</Text>
                </View>
            </View>

            <View className="pt-4 pb-2">
                {/* Search Bar */}
                <View className="bg-gray-100 flex-row items-center px-4 py-3 rounded-xl mx-4 mb-3">
                    <Ionicons name="search" size={20} color="#9ca3af" />
                    <TextInput
                        placeholder="Search staff by name..."
                        className="flex-1 ml-3 text-gray-800 font-medium"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {/* Department Info */}
                <View className="px-4 mb-3">
                    <View className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-lg self-start">
                        <Text className="text-blue-700 font-bold">Department: {issue.department}</Text>
                    </View>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#000" className="mt-10" />
            ) : (
                <FlatList
                    data={filteredStaff}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: 10 }}
                    ListEmptyComponent={<Text className="text-center text-gray-500 mt-10">No staff members found.</Text>}
                />
            )}
        </SafeAreaView>
    );
};

export default AssignStaffScreen;
