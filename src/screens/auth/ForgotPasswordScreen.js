import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { axiosPublic } from '../../api/axiosConfig';

const ForgotPasswordScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendOtp = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        setIsLoading(true);
        try {
            await axiosPublic.post('/users/forgot-password', { email });
            // Alert user and navigate
            Alert.alert('OTP Sent', 'If an account exists, an OTP has been sent to your email.');
            navigation.navigate('VerifyOtp', { email });
        } catch (error) {
            console.error(error);
            // Even if email not found, security practice says generic message. 
            // But if our backend confirms "email sent", we show success.
            // If backend errs, show logic err.
            Alert.alert('Error', error.response?.data?.message || 'Failed to send OTP');
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

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 px-6 justify-center"
            >
                <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}>
                    <View className="mb-8">
                        <Text className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</Text>
                        <Text className="text-gray-500 text-base">
                            Don't worry! It happens. Please enter the email address linked with your account.
                        </Text>
                    </View>

                    <View className="space-y-4">
                        <Text className="text-gray-700 font-medium ml-1">Email Address</Text>
                        <TextInput
                            className="w-full border border-gray-200 rounded-2xl px-5 py-4 bg-gray-50 text-gray-900 text-lg"
                            placeholder="Enter your email"
                            placeholderTextColor="#9ca3af"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <TouchableOpacity
                        className="bg-primary rounded-2xl py-4 mt-8 shadow-lg shadow-blue-200"
                        onPress={handleSendOtp}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-center font-bold text-lg">Send OTP</Text>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default ForgotPasswordScreen;
