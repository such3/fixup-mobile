import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { axiosPublic } from '../../api/axiosConfig';

const VerifyOtpScreen = ({ navigation, route }) => {
    const { email } = route.params || { email: 'your email' };
    const [otpCode, setOtpCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = async () => {
        if (otpCode.length < 6) {
            Alert.alert('Error', 'Please enter a valid 6-digit OTP');
            return;
        }

        setIsLoading(true);
        try {
            // Validate OTP first
            await axiosPublic.post('/users/verify-otp', { email, otp: otpCode });

            // If success, navigate to ResetPassword
            // Pass OTP as 'token' for the reset step
            navigation.navigate('ResetPassword', { email, otp: otpCode });

        } catch (error) {
            console.error(error);
            Alert.alert('Error', error.response?.data?.message || 'Invalid OTP');
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
                        <Text className="text-3xl font-bold text-gray-900 mb-2">OTP Verification</Text>
                        <Text className="text-gray-500 text-base">
                            Enter the 6-digit verification code we just sent on your email address.
                        </Text>
                        <Text className="text-primary font-bold mt-1 text-lg">{email}</Text>
                    </View>

                    <View>
                        <TextInput
                            className="w-full border border-gray-200 rounded-2xl px-5 py-4 bg-gray-50 text-center text-3xl font-bold tracking-widest text-gray-900"
                            placeholder="• • • • • •"
                            placeholderTextColor="#e2e8f0"
                            value={otpCode}
                            onChangeText={setOtpCode}
                            keyboardType="number-pad"
                            maxLength={6}
                        />
                    </View>

                    <TouchableOpacity
                        className="bg-primary rounded-2xl py-4 mt-8 shadow-lg shadow-blue-200"
                        onPress={handleVerify}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-center font-bold text-lg">Verify & Proceed</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default VerifyOtpScreen;
