import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { axiosPrivate } from '../../api/axiosConfig';
import { useToast } from '../../context/ToastContext';

const ResolveIssueScreen = ({ route, navigation }) => {
    const { issue } = route.params;
    const insets = useSafeAreaInsets();
    const { showToast } = useToast();

    const [remarks, setRemarks] = useState('');
    const [images, setImages] = useState([]); // Changed to array
    const [isLoading, setIsLoading] = useState(false);

    const handleTakePhoto = async () => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: false,
                quality: 0.7,
            });

            if (!result.canceled) {
                setImages(prev => [...prev, result.assets[0].uri]);
            }
        } catch (error) {
            Alert.alert("Error", "Could not open camera.");
        }
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleResolve = async () => {
        // Validation
        if (!remarks.trim()) {
            showToast('warning', 'Missing Remarks', 'Please describe how you resolved the issue.');
            return;
        }
        if (images.length === 0) {
            showToast('warning', 'Proof Required', 'Please take at least one photo to prove the issue is fixed.');
            return;
        }

        setIsLoading(true);
        try {
            // 1. Upload Media
            const formData = new FormData();

            images.forEach((uri) => {
                const filename = uri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;
                formData.append('files', { uri, name: filename, type });
            });

            // Note: Ensuring the endpoint matches the backend expectation for "files"
            await axiosPrivate.post(`/issues/${issue._id}/media`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // 2. Update Remarks
            await axiosPrivate.patch(`/issues/${issue._id}/remarks`, {
                remarks: remarks
            });

            // 3. Update Status
            await axiosPrivate.patch(`/issues/${issue._id}/status`, {
                status: 'Resolved'
            });

            showToast('success', 'Resolved!', 'Great job. The issue has been closed.');
            navigation.goBack();
        } catch (error) {
            console.error("Resolution failed", error);
            showToast('error', 'Error', 'Failed to resolve issue. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 bg-white z-10">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-gray-50 rounded-full mr-3">
                        <Ionicons name="arrow-back" size={24} color="black" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900">Resolve Issue</Text>
                </View>

                {/* Header Action Button */}
                <TouchableOpacity
                    onPress={handleResolve}
                    disabled={isLoading || !remarks.trim() || images.length === 0}
                    className={`px-4 py-2 rounded-full ${(!remarks.trim() || images.length === 0) ? 'bg-gray-100' : 'bg-green-600'}`}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={(!remarks.trim() || images.length === 0) ? "#9ca3af" : "white"} />
                    ) : (
                        <Text className={`font-bold ${(!remarks.trim() || images.length === 0) ? 'text-gray-400' : 'text-white'}`}>Resolve</Text>
                    )}
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <ScrollView
                    className="flex-1 p-5"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
                >

                    {/* Issue Summary */}
                    <View className="bg-blue-50 p-4 rounded-2xl mb-6 border border-blue-100">
                        <View className="flex-row items-center mb-2">
                            <Ionicons name="information-circle" size={20} color="#1e40af" />
                            <Text className="font-bold text-blue-800 text-lg ml-2 flex-1">{issue.title}</Text>
                        </View>
                        <Text className="text-blue-600 leading-5">{issue.description}</Text>
                    </View>

                    {/* Remarks Input */}
                    <Text className="font-bold text-gray-700 mb-2 text-base">
                        Resolution Remarks <Text className="text-red-500">*</Text>
                    </Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 min-h-[120px] text-base text-gray-800"
                        placeholder="Describe the fix (e.g., Replaced the broken part...)"
                        placeholderTextColor="#9ca3af"
                        multiline
                        value={remarks}
                        onChangeText={setRemarks}
                        textAlignVertical="top"
                    />

                    {/* Photo Proof */}
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="font-bold text-gray-700 text-base">
                            Proof of Work <Text className="text-red-500">*</Text>
                        </Text>
                        <Text className="text-gray-400 text-xs">{images.length} added</Text>
                    </View>

                    {/* Images List */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                        {images.map((uri, index) => (
                            <View key={index} className="mr-3 relative">
                                <Image
                                    source={{ uri }}
                                    className="w-24 h-24 rounded-xl bg-gray-100"
                                    resizeMode="cover"
                                />
                                <TouchableOpacity
                                    onPress={() => removeImage(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center border border-white"
                                >
                                    <Ionicons name="close" size={14} color="white" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        {/* Add Button */}
                        <TouchableOpacity
                            onPress={handleTakePhoto}
                            className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl items-center justify-center bg-gray-50 active:bg-gray-100"
                        >
                            <Ionicons name="camera" size={28} color="#9ca3af" />
                            <Text className="text-xs text-gray-400 font-bold mt-1">Add Photo</Text>
                        </TouchableOpacity>
                    </ScrollView>

                    {images.length === 0 && (
                        <Text className="text-gray-400 text-sm italic mb-8 text-center bg-gray-50 py-4 rounded-xl border border-dashed border-gray-200">
                            No images added yet. Tap "Add Photo" to start.
                        </Text>
                    )}

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};
export default ResolveIssueScreen;
