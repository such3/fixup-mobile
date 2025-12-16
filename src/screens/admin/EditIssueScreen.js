import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Platform, Alert, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { axiosPrivate } from '../../api/axiosConfig';
import { useToast } from '../../context/ToastContext';

import { DEPARTMENTS, STATUSES, PRIORITIES } from '../../constants/departments';

// Removed hardcoded arrays

const EditIssueScreen = ({ route, navigation }) => {
    const { issue } = route.params;
    const { showToast } = useToast();

    // Form State
    const [title, setTitle] = useState(issue.title || '');
    const [description, setDescription] = useState(issue.description || '');
    const [department, setDepartment] = useState(issue.department || '');
    const [priority, setPriority] = useState(issue.priority || 'Medium');
    const [status, setStatus] = useState(issue.status || 'not started');
    const [location, setLocation] = useState(issue.location || '');

    // Assignment State
    const [staffAssigned, setStaffAssigned] = useState(issue.staffAssigned?._id || issue.staffAssigned || null);
    const [staffList, setStaffList] = useState([]);
    const [staffLoading, setStaffLoading] = useState(false);

    const [loading, setLoading] = useState(false);

    // Fetch Staff when Department changes
    useEffect(() => {
        if (department) fetchStaff();
    }, [department]);

    const fetchStaff = async () => {
        setStaffLoading(true);
        try {
            // Fetch staff for this department
            const response = await axiosPrivate.get(`/users/staff?dept=${department}`);
            if (response.data.success) {
                setStaffList(response.data.data);
            }
        } catch (error) {
            console.log("Fetch staff failed", error);
            setStaffList([]);
        } finally {
            setStaffLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                title,
                description,
                department,
                priority,
                status,
                location,
                staffAssigned // sending ID
            };

            await axiosPrivate.patch(`/issues/${issue._id}/details`, payload);
            showToast('success', 'Updated', 'Issue updated successfully');

            // Navigate back to Admin List, which should auto-refresh via focus effect
            navigation.navigate('AdminIssueList');
        } catch (error) {
            console.error("Update Issue error", error);
            showToast('error', 'Error', 'Failed to update issue');
        } finally {
            setLoading(false);
        }
    };

    const SectionLabel = ({ text }) => <Text className="text-gray-500 font-bold uppercase text-xs mb-2 mt-4 ml-1">{text}</Text>;
    const OptionPill = ({ label, selected, onPress, color = 'bg-black' }) => (
        <TouchableOpacity
            onPress={onPress}
            className={`px-4 py-2 rounded-full mr-2 mb-2 border ${selected ? `${color} border-transparent` : 'bg-white border-gray-200'}`}
        >
            <Text className={`font-bold capitalize ${selected ? 'text-white' : 'text-gray-600'}`}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" style={{ paddingTop: Platform.OS === 'android' ? 20 : 0 }}>
            {/* Header */}
            <View className="px-5 py-4 bg-white border-b border-gray-100 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-gray-50 rounded-full">
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text className="font-bold text-lg text-gray-900">Edit Issue</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    {loading ? <ActivityIndicator size="small" color="#2563eb" /> : <Text className="text-blue-600 font-bold text-base">Save</Text>}
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-5 pt-2" showsVerticalScrollIndicator={false}>
                <SectionLabel text="Core Details" />
                <View className="bg-white p-4 rounded-xl border border-gray-100 mb-2">
                    <Text className="text-gray-400 text-xs mb-1">Issue Title</Text>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        className="text-base text-gray-900 font-medium border-b border-gray-100 pb-2 mb-3"
                    />

                    <Text className="text-gray-400 text-xs mb-1">Description</Text>
                    <TextInput
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        className="text-base text-gray-900 font-medium border-b border-gray-100 pb-2 mb-3 h-20"
                        style={{ textAlignVertical: 'top' }}
                    />

                    <Text className="text-gray-400 text-xs mb-1">Location / Room No</Text>
                    <TextInput
                        value={location}
                        onChangeText={setLocation}
                        className="text-base text-gray-900 font-medium pb-1"
                    />
                </View>

                <SectionLabel text="Properties" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                    {DEPARTMENTS.map(d => (
                        <OptionPill key={d} label={d} selected={department === d} onPress={() => setDepartment(d)} color="bg-blue-600" />
                    ))}
                </ScrollView>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                    {PRIORITIES.map(p => (
                        <OptionPill key={p} label={p} selected={priority === p} onPress={() => setPriority(p)} color="bg-red-500" />
                    ))}
                </ScrollView>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                    {STATUSES.map(s => (
                        <OptionPill key={s} label={s} selected={status === s} onPress={() => setStatus(s)} color="bg-green-600" />
                    ))}
                </ScrollView>

                <SectionLabel text="Assigned Worker" />
                <View className="bg-white rounded-xl border border-gray-100 overflow-hidden mb-10">
                    {staffLoading ? (
                        <ActivityIndicator size="small" className="py-4" color="#2563eb" />
                    ) : staffList.length === 0 ? (
                        <Text className="text-gray-400 text-center py-4">No staff found in this department.</Text>
                    ) : (
                        staffList.map((staff, index) => (
                            <TouchableOpacity
                                key={staff._id}
                                onPress={() => setStaffAssigned(staff._id)}
                                className={`flex-row items-center p-3 ${index !== staffList.length - 1 ? 'border-b border-gray-50' : ''} ${staffAssigned === staff._id ? 'bg-blue-50' : 'bg-white'}`}
                            >
                                <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${staffAssigned === staff._id ? 'bg-blue-200' : 'bg-gray-100'}`}>
                                    <Ionicons name="person" size={16} color={staffAssigned === staff._id ? '#1e40af' : '#6b7280'} />
                                </View>
                                <View className="flex-1">
                                    <Text className={`font-medium ${staffAssigned === staff._id ? 'text-blue-900' : 'text-gray-900'}`}>{staff.fullName}</Text>
                                    <Text className="text-xs text-gray-500">{staff.email}</Text>
                                </View>
                                {staffAssigned === staff._id && <Ionicons name="checkmark-circle" size={20} color="#2563eb" />}
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
};

export default EditIssueScreen;
