import React, { useContext, useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    TouchableWithoutFeedback,
    Keyboard,
    ScrollView,
    Platform
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const LoginScreen = ({ navigation }) => {
    const { login } = useContext(AuthContext);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);

    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            () => {
                setKeyboardVisible(true);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardVisible(false);
            }
        );

        return () => {
            keyboardDidHideListener.remove();
            keyboardDidShowListener.remove();
        };
    }, []);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setIsLoading(true);
        try {
            await login(email, password);
        } catch (error) {
            Alert.alert('Login Failed', 'Please check your email and password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 80}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        paddingBottom: isKeyboardVisible ? 100 : 20 // Adjust padding for footer
                    }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="flex-1 justify-center px-6 py-10 bg-white">
                        {/* Logo / Header */}
                        <View className="items-center mb-10">
                            <View className="w-24 h-24 bg-primary rounded-full justify-center items-center mb-4">
                                <Text className="text-white text-4xl font-bold">F</Text>
                            </View>
                            <Text className="text-4xl font-bold text-primary mb-2">FixUp</Text>
                            <Text className="text-gray-500 text-lg">Community Issue Tracker</Text>
                        </View>

                        {/* Form */}
                        <View className="space-y-4">
                            {/* Email */}
                            <View>
                                <Text className="text-gray-700 mb-2 font-medium ml-1">Email Address</Text>
                                <TextInput
                                    className="w-full border border-gray-200 rounded-2xl px-5 py-4 bg-gray-50 text-gray-900"
                                    placeholder="enter your email"
                                    placeholderTextColor="#9ca3af"
                                    value={email}
                                    onChangeText={setEmail}
                                    autoCapitalize="none"
                                    keyboardType="email-address"
                                />
                            </View>

                            {/* Password */}
                            <View>
                                <Text className="text-gray-700 mb-2 font-medium ml-1">Password</Text>

                                <View className="relative">
                                    <TextInput
                                        className="w-full border border-gray-200 rounded-2xl px-5 py-4 bg-gray-50 text-gray-900 pr-12"
                                        placeholder="enter your password"
                                        placeholderTextColor="#9ca3af"
                                        value={password}
                                        onChangeText={setPassword}
                                        secureTextEntry={!showPassword}
                                    />

                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-4"
                                    >
                                        <Ionicons
                                            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                            size={22}
                                            color="#6b7280"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={() => navigation.navigate('ForgotPassword')}
                                className="self-end"
                            >
                                <Text className="text-primary font-bold">Forgot Password?</Text>
                            </TouchableOpacity>

                            {/* Login Button */}
                            <TouchableOpacity
                                className="bg-primary rounded-2xl py-4 mt-6 mb-10"
                                onPress={handleLogin}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-white text-center font-bold text-lg">Log In</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Footer - Project Info */}
                    {!isKeyboardVisible && (
                        <View className="py-6 items-center">
                            <TouchableOpacity
                                onPress={() => navigation.navigate('ProjectInfo')}
                                className="flex-row items-center px-4 py-2"
                            >
                                <Ionicons name="information-circle-outline" size={20} color="#9ca3af" />
                                <Text className="text-gray-500 font-medium ml-2">About Project & Team</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;
