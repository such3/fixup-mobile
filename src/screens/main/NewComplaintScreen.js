import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Ionicons } from '@expo/vector-icons';
import { axiosPrivate } from '../../api/axiosConfig';
import { DEPARTMENTS } from '../../constants/departments';
import Dropdown from '../../components/Dropdown';
import { useToast } from '../../context/ToastContext';

const NewComplaintScreen = ({ navigation }) => {
    // Convert string array to objects for Dropdown
    const deptOptions = DEPARTMENTS.map(d => ({ label: d, value: d }));

    const { showToast } = useToast();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    // Initialize with first option object
    const [department, setDepartment] = useState(deptOptions[0]);

    // Changed to array for multiple media
    const [media, setMedia] = useState([]);
    const [attachedFile, setAttachedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Camera Handler (Single Photo)
    const handleTakePhoto = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (permissionResult.granted === false) {
            showToast('error', 'Permission Required', "You've refused to allow this app to access your camera!");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false, // Editing often conflicts with multiple items, kept false for simplicity
            quality: 0.7,
        });

        if (!result.canceled) {
            setMedia(prev => [...prev, result.assets[0]]);
        }
    };

    // Gallery Picker (Multiple Images & Videos)
    const handlePickMedia = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaType.All, // Updated from MediaTypeOptions
            allowsMultipleSelection: true,
            selectionLimit: 5, // Reasonable limit
            quality: 0.7,
        });

        if (!result.canceled) {
            setMedia(prev => [...prev, ...result.assets]);
        }
    };

    const removeMedia = (index) => {
        setMedia(prev => prev.filter((_, i) => i !== index));
    };

    // File Picker Handler
    const handlePickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({});
            if (result.assets && result.assets.length > 0) {
                setAttachedFile(result.assets[0]);
            }
        } catch (err) {
            console.log("Unknown error: ", err);
        }
    };

    const handleSubmit = async () => {
        if (!title || !description || !location || !department) {
            showToast('warning', 'Missing Fields', 'Please fill in title, description, location, and department');
            return;
        }

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('location', location);
            // Department is an object { label, value } from Dropdown
            formData.append('department', department.value);

            // Append Media (Images/Videos)
            media.forEach((asset, index) => {
                const uri = asset.uri;
                const filename = uri.split('/').pop();

                // Determine type
                let type = 'image/jpeg'; // fallback
                if (asset.type === 'video') {
                    type = 'video/mp4';
                } else {
                    const match = /\.(\w+)$/.exec(filename);
                    type = match ? `image/${match[1]}` : `image/jpeg`;
                    if (type === 'image/jpg') type = 'image/jpeg';
                }

                formData.append('files', { uri, name: filename, type });
            });

            // Append Document
            if (attachedFile) {
                formData.append('files', {
                    uri: attachedFile.uri,
                    name: attachedFile.name || 'attachment',
                    type: attachedFile.mimeType || 'application/octet-stream'
                });
            }

            await axiosPrivate.post('/issues', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            // Reset Form
            setTitle('');
            setDescription('');
            setLocation('');
            setDepartment(DEPARTMENTS[0]);
            setMedia([]);
            setAttachedFile(null);

            showToast('success', 'Success', 'Issue reported successfully!');
            navigation.goBack();
        } catch (error) {
            console.error('Submission error', error.response?.data || error);
            showToast('error', 'Error', 'Failed to submit issue');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: Platform.OS === 'android' ? 60 : 0 }}>
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-gray-50 rounded-full mr-3">
                    <Ionicons name="close" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-900">New Issue</Text>
            </View>

            <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
                <View className="space-y-5">

                    {/* Title */}
                    <View>
                        <Text className="text-gray-700 font-bold mb-2 ml-1 text-xs uppercase tracking-wider">
                            Title <Text className="text-red-500">*</Text>
                        </Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-base font-medium text-gray-900 focus:border-primary focus:bg-white"
                            placeholder="What's the issue?"
                            placeholderTextColor="#9ca3af"
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    {/* Department */}
                    <View>
                        <Text className="text-gray-700 font-bold mb-2 ml-1 text-xs uppercase tracking-wider">
                            Department <Text className="text-red-500">*</Text>
                        </Text>
                        <Dropdown
                            label="" // Label handled above
                            items={deptOptions}
                            selectedValue={department}
                            onValueChange={setDepartment}
                            placeholder="Select Department"
                        />
                    </View>

                    {/* Location */}
                    <View>
                        <Text className="text-gray-700 font-bold mb-2 ml-1 text-xs uppercase tracking-wider">
                            Location <Text className="text-red-500">*</Text>
                        </Text>
                        <View className="relative">
                            <View className="absolute left-4 top-4 z-10">
                                <Ionicons name="location-outline" size={20} color="#6b7280" />
                            </View>
                            <TextInput
                                className="bg-gray-50 border border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-base font-medium text-gray-900 focus:border-primary focus:bg-white"
                                placeholder="Where is it? (e.g. Narmada 101)"
                                placeholderTextColor="#9ca3af"
                                value={location}
                                onChangeText={setLocation}
                            />
                        </View>
                    </View>

                    {/* Description */}
                    <View>
                        <Text className="text-gray-700 font-bold mb-2 ml-1 text-xs uppercase tracking-wider">
                            Description <Text className="text-red-500">*</Text>
                        </Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-base text-gray-900 focus:border-primary focus:bg-white min-h-[120px]"
                            placeholder="Describe the issue in detail..."
                            placeholderTextColor="#9ca3af"
                            multiline
                            numberOfLines={4}
                            value={description}
                            onChangeText={setDescription}
                            style={{ textAlignVertical: 'top' }}
                        />
                    </View>

                    {/* Media Attachments */}
                    <View>
                        <Text className="text-gray-700 font-bold mb-2 ml-1 text-xs uppercase tracking-wider">
                            Attachments <Text className="text-red-500">*</Text>
                        </Text>

                        <View className="flex-row items-center justify-between mb-3">
                            <View className="flex-row space-x-2">
                                <TouchableOpacity
                                    onPress={handleTakePhoto}
                                    className="bg-blue-50 p-3 rounded-xl border border-blue-100 items-center justify-center mr-2"
                                >
                                    <Ionicons name="camera" size={24} color="#2563eb" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handlePickMedia}
                                    className="bg-purple-50 p-3 rounded-xl border border-purple-100 items-center justify-center mr-2"
                                >
                                    <Ionicons name="images" size={24} color="#9333ea" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handlePickFile}
                                    className="bg-gray-50 p-3 rounded-xl border border-gray-200 items-center justify-center"
                                >
                                    <Ionicons name="document-attach" size={24} color="#4b5563" />
                                </TouchableOpacity>
                            </View>
                            <Text className="text-xs text-gray-400">{media.length} items</Text>
                        </View>

                        {/* Media Preview Scroll */}
                        {media.length > 0 && (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                                {media.map((asset, index) => (
                                    <View key={index} className="mr-3 relative">
                                        <Image
                                            source={{ uri: asset.uri }}
                                            className="w-24 h-24 rounded-xl bg-gray-100 border border-gray-200"
                                            resizeMode="cover"
                                        />
                                        {asset.type === 'video' && (
                                            <View className="absolute inset-0 items-center justify-center bg-black/20 rounded-xl">
                                                <Ionicons name="play-circle" size={30} color="white" />
                                            </View>
                                        )}
                                        <TouchableOpacity
                                            onPress={() => removeMedia(index)}
                                            className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center border-2 border-white shadow-sm"
                                        >
                                            <Ionicons name="close" size={14} color="white" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        )}

                        {/* Document Preview */}
                        {attachedFile && (
                            <View className="bg-white p-4 rounded-2xl border border-gray-200 flex-row justify-between items-center shadow-sm">
                                <View className="flex-row items-center flex-1 mr-2">
                                    <View className="w-10 h-10 bg-orange-100 rounded-lg items-center justify-center mr-3">
                                        <Ionicons name="document-text" size={20} color="#ea580c" />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-gray-900 font-bold text-sm" numberOfLines={1}>{attachedFile.name}</Text>
                                        <Text className="text-gray-500 text-xs">{(attachedFile.size / 1024).toFixed(0)} KB</Text>
                                    </View>
                                </View>
                                <TouchableOpacity onPress={() => setAttachedFile(null)} className="p-2">
                                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        className={`bg-primary py-4 rounded-2xl shadow-lg shadow-blue-300 mt-2 ${isLoading ? 'opacity-70' : ''}`}
                        onPress={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <View className="flex-row items-center justify-center">
                                <Text className="text-white font-bold text-lg mr-2">Submit Report</Text>
                                <Ionicons name="send" size={18} color="white" />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default NewComplaintScreen;
