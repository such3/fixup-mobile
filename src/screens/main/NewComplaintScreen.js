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
    const [image, setImage] = useState(null);
    const [attachedFile, setAttachedFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Camera Handler
    const handleTakePhoto = async () => {
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

        if (permissionResult.granted === false) {
            showToast('error', 'Permission Required', "You've refused to allow this app to access your camera!");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.7,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
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

            // ... (rest of submission logic)

            // Backend expects 'files' for both images and documents
            if (image) {
                const filename = image.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                // Fix: map 'jpg' to 'jpeg' strictly if desired, but flexible now
                let type = match ? `image/${match[1]}` : `image/jpeg`;
                if (type === 'image/jpg') type = 'image/jpeg';

                formData.append('files', { uri: image, name: filename, type });
            }

            if (attachedFile) {
                formData.append('files', {
                    uri: attachedFile.uri,
                    name: attachedFile.name || 'attachment', // Fallback name
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
            setImage(null);
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
                        <View className="flex-row items-center border border-gray-200 rounded-2xl p-1 bg-gray-50">
                            <TouchableOpacity
                                onPress={handleTakePhoto}
                                className="flex-1 py-4 rounded-xl items-center bg-white shadow-sm mr-1"
                            >
                                <View className="bg-blue-100 p-2 rounded-full mb-1">
                                    <Ionicons name="camera" size={24} color="#2563eb" />
                                </View>
                                <Text className="text-gray-900 font-bold text-sm">Take Photo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={handlePickFile}
                                className="flex-1 py-4 rounded-xl items-center"
                            >
                                <Ionicons name="document-attach-outline" size={24} color="#6b7280" />
                                <Text className="text-gray-500 font-bold text-sm mt-1">Upload File</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Previews */}
                    {image && (
                        <View className="relative rounded-2xl overflow-hidden shadow-sm">
                            <Image source={{ uri: image }} className="w-full h-56 bg-gray-100" resizeMode="cover" />
                            <TouchableOpacity
                                onPress={() => setImage(null)}
                                className="absolute top-3 right-3 bg-black/50 rounded-full w-8 h-8 items-center justify-center backdrop-blur-md"
                            >
                                <Ionicons name="close" size={20} color="white" />
                            </TouchableOpacity>
                        </View>
                    )}

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
