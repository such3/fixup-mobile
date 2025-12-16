import React, { useContext, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, Modal, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { axiosPrivate } from '../../api/axiosConfig';

const ProfileScreen = () => {
    const { user, logout } = useContext(AuthContext);
    const [modalVisible, setModalVisible] = useState(false);

    // Change Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword) {
            Alert.alert("Error", "Please fill both password fields");
            return;
        }

        setIsSubmitting(true);
        try {
            await axiosPrivate.patch(`/users/${user._id}/password`, {
                currentPassword,
                newPassword
            });
            Alert.alert("Success", "Password updated successfully");
            setModalVisible(false);
            setCurrentPassword('');
            setNewPassword('');
        } catch (error) {
            console.error(error);
            Alert.alert("Failed", error.response?.data?.message || "Could not update password");
        } finally {
            setIsSubmitting(false);
        }
    };

    const DetailRow = ({ label, value, icon }) => (
        <View className="bg-gray-50 mb-3 p-4 rounded-xl flex-row items-center border border-gray-100">
            <View className="bg-white p-2 rounded-full mr-4 shadow-sm">
                <Ionicons name={icon} size={20} color="#2563eb" />
            </View>
            <View className="flex-1">
                <Text className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-1">{label}</Text>
                <Text className="text-gray-900 font-medium text-base">{value || 'N/A'}</Text>
            </View>
            <Ionicons name="lock-closed" size={16} color="#cbd5e1" />
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: Platform.OS === 'android' ? 60 : 0 }}>
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
                <View className="items-center mt-8 mb-8">
                    <View className="w-24 h-24 bg-primary/10 rounded-full items-center justify-center mb-4 border-2 border-primary/20">
                        <Text className="text-4xl font-bold text-primary">
                            {user?.fullName?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <Text className="text-2xl font-bold text-gray-900">{user?.fullName}</Text>
                    <View className="flex-row items-center mt-2 bg-primary/10 px-3 py-1 rounded-full">
                        <Text className="text-primary font-bold text-xs uppercase tracking-widest">{user?.role || 'User'}</Text>
                    </View>
                </View>

                <View className="px-6">
                    <Text className="text-lg font-bold text-gray-900 mb-4">Personal Details</Text>
                    <DetailRow label="Email Address" value={user?.email} icon="mail-outline" />
                    <DetailRow label="User ID (UID)" value={user?.uid} icon="card-outline" />

                    {/* Show Department only for Staff and Admin (assuming Admin might want to see it too, keeping it strict if requested) */}
                    {(user?.role === 'staff' || user?.role === 'admin') && (
                        <DetailRow label="Department" value={user?.deptUnder} icon="business-outline" />
                    )}

                    <Text className="text-lg font-bold text-gray-900 mt-6 mb-4">Account Actions</Text>

                    <TouchableOpacity
                        onPress={() => setModalVisible(true)}
                        className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex-row items-center justify-between mb-3"
                    >
                        <View className="flex-row items-center">
                            <Ionicons name="key-outline" size={20} color="#2563eb" />
                            <Text className="ml-3 text-blue-700 font-bold">Change Password</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#2563eb" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={logout}
                        className="bg-red-50 border border-red-100 p-4 rounded-xl flex-row items-center justify-center mt-2 mb-10"
                    >
                        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
                        <Text className="ml-2 text-red-600 font-bold">Log Out</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6 h-[60%]">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-900">Change Password</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Ionicons name="close-circle" size={30} color="#94a3b8" />
                            </TouchableOpacity>
                        </View>

                        <View className="space-y-4">
                            <View>
                                <Text className="text-gray-700 font-medium mb-1">Current Password</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                                    secureTextEntry
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    placeholder="Enter current password"
                                />
                            </View>

                            <View>
                                <Text className="text-gray-700 font-medium mb-1">New Password</Text>
                                <TextInput
                                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                                    secureTextEntry
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder="Enter new password"
                                />
                            </View>

                            <TouchableOpacity
                                onPress={handleChangePassword}
                                disabled={isSubmitting}
                                className="bg-primary py-4 rounded-xl mt-4 shadow-lg flex-row justify-center"
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white font-bold text-lg">Update Password</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default ProfileScreen;
