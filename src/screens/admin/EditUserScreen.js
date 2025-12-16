import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { axiosPrivate } from '../../api/axiosConfig';
import { useToast } from '../../context/ToastContext';

import { DEPARTMENTS } from '../../constants/departments';

// Removed hardcoded DEPARTMENTS
const ROLES = ['student', 'staff', 'admin'];

const EditUserScreen = ({ route, navigation }) => {
    const { user } = route.params;
    const { showToast } = useToast();

    const [fullName, setFullName] = useState(user.fullName || '');
    const [email, setEmail] = useState(user.email || '');
    const [uid, setUid] = useState(user.uid || '');
    const [role, setRole] = useState(user.role || 'student');
    const [deptUnder, setDeptUnder] = useState(user.deptUnder || '');

    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!fullName || !email) {
            showToast('error', 'Validation Error', 'Name and Email are required.');
            return;
        }

        setLoading(true);
        try {
            await axiosPrivate.patch(`/users/${user._id}`, {
                fullName,
                email,
                uid,
                role,
                deptUnder
            });
            showToast('success', 'Updated', 'User profile updated successfully');
            navigation.goBack();
        } catch (error) {
            console.error("Update error", error);
            const msg = error.response?.data?.message || 'Failed to update user';
            showToast('error', 'Update Failed', msg);
        } finally {
            setLoading(false);
        }
    };

    const SectionLabel = ({ text }) => <Text className="text-gray-500 font-bold uppercase text-xs mb-2 mt-4 ml-1">{text}</Text>;

    return (
        <SafeAreaView className="flex-1 bg-gray-50" style={{ paddingTop: Platform.OS === 'android' ? 20 : 0 }}>
            <View className="px-5 py-4 bg-white border-b border-gray-100 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-gray-50 rounded-full">
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text className="font-bold text-lg text-gray-900">Edit User</Text>
                <TouchableOpacity onPress={handleSave} disabled={loading}>
                    {loading ? <ActivityIndicator size="small" color="#2563eb" /> : <Text className="text-blue-600 font-bold text-base">Save</Text>}
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-5 pt-2">
                <SectionLabel text="Personal Information" />
                <View className="bg-white p-4 rounded-xl border border-gray-100 mb-2">
                    <Text className="text-gray-400 text-xs mb-1">Full Name</Text>
                    <TextInput
                        value={fullName}
                        onChangeText={setFullName}
                        className="text-base text-gray-900 font-medium border-b border-gray-100 pb-2 mb-3"
                    />

                    <Text className="text-gray-400 text-xs mb-1">Email Address</Text>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        className="text-base text-gray-900 font-medium border-b border-gray-100 pb-2 mb-3"
                    />

                    <Text className="text-gray-400 text-xs mb-1">University ID (UID)</Text>
                    <TextInput
                        value={uid}
                        onChangeText={setUid}
                        className="text-base text-gray-900 font-medium pb-1"
                    />
                </View>

                <SectionLabel text="Role & Permissions" />
                <View className="flex-row flex-wrap mb-2">
                    {ROLES.map(r => (
                        <TouchableOpacity
                            key={r}
                            onPress={() => setRole(r)}
                            className={`px-4 py-2 rounded-full mr-2 mb-2 border ${role === r ? 'bg-black border-black' : 'bg-white border-gray-200'}`}
                        >
                            <Text className={`font-bold capitalize ${role === r ? 'text-white' : 'text-gray-600'}`}>{r}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {(role === 'staff' || role === 'admin') && (
                    <>
                        <SectionLabel text="Department" />
                        <View className="flex-row flex-wrap">
                            {DEPARTMENTS.map(d => (
                                <TouchableOpacity
                                    key={d}
                                    onPress={() => setDeptUnder(d)}
                                    className={`px-4 py-2 rounded-full mr-2 mb-2 border ${deptUnder === d ? 'bg-primary border-primary' : 'bg-white border-gray-200'}`}
                                    style={{ backgroundColor: deptUnder === d ? '#eff6ff' : 'white', borderColor: deptUnder === d ? '#2563eb' : '#e5e7eb' }}
                                >
                                    <Text className={`font-bold ${deptUnder === d ? 'text-blue-600' : 'text-gray-600'}`}>{d}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </>
                )}

                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
};

export default EditUserScreen;
