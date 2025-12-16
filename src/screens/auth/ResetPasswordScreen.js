import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { axiosPublic } from '../../api/axiosConfig';

const ResetPasswordScreen = ({ navigation, route }) => {
    const { email, otp } = route.params || {};
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleReset = async () => {
        if (!password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }
        if (password.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters long');
            return;
        }

        setIsLoading(true);
        try {
            await axiosPublic.post('/users/reset-password', {
                email,
                token: otp,
                newPassword: password
            });

            Alert.alert('Success', 'Password reset successfully! Login with your new password.', [
                { text: 'Login', onPress: () => navigation.popToTop() }
            ]);

        } catch (error) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.message || 'Failed to reset password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="px-4 py-3">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-gray-50 rounded-full self-start">
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 px-6 justify-center">
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                    <View className="mb-8">
                        <Text className="text-3xl font-bold text-gray-900 mb-2">Create new password</Text>
                        <Text className="text-gray-500 text-base">
                            Your new password must be unique from those previously used.
                        </Text>
                    </View>

                    <View className="space-y-4">
                        {/* New Password */}
                        <View>
                            <Text className="text-gray-700 font-medium ml-1 mb-1">New Password</Text>
                            <TextInput
                                className="w-full border border-gray-200 rounded-2xl px-5 py-4 bg-gray-50 text-gray-900"
                                placeholder="Min 8 chars"
                                placeholderTextColor="#9ca3af"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                            />
                        </View>

                        {/* Confirm Password */}
                        <View>
                            <Text className="text-gray-700 font-medium ml-1 mb-1">Confirm Password</Text>
                            <TextInput
                                className="w-full border border-gray-200 rounded-2xl px-5 py-4 bg-gray-50 text-gray-900"
                                placeholder="Re-enter password"
                                placeholderTextColor="#9ca3af"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry={!showPassword}
                            />
                        </View>

                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="self-end mt-2 p-1">
                            <Text className="text-gray-500 font-medium">{showPassword ? 'Hide Password' : 'Show Password'}</Text>
                        </TouchableOpacity>

                    </View>

                    <TouchableOpacity
                        className="bg-primary rounded-2xl py-4 mt-8 shadow-lg shadow-blue-200"
                        onPress={handleReset}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-center font-bold text-lg">Reset Password</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ResetPasswordScreen;
