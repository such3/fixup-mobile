import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { axiosPrivate } from '../../api/axiosConfig';
import { useToast } from '../../context/ToastContext';
import * as DocumentPicker from 'expo-document-picker';

import { DEPARTMENTS } from '../../constants/departments';

// Roles based on backend model
const ROLES = ['student', 'staff', 'dept', 'admin'];

const CreateUserScreen = ({ navigation }) => {
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('single'); // 'single' or 'batch'

    // Single User Form State
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [uid, setUid] = useState('');
    const [role, setRole] = useState('student');
    const [deptUnder, setDeptUnder] = useState('');
    const [loading, setLoading] = useState(false);

    // Batch Upload State
    const [selectedFile, setSelectedFile] = useState(null);
    const [batchLoading, setBatchLoading] = useState(false);
    const [batchResults, setBatchResults] = useState(null);

    const handleCreateSingle = async () => {
        if (!fullName || !email || !uid) {
            showToast('error', 'Validation Error', 'Name, Email, and UID are required.');
            return;
        }
        if ((role === 'staff' || role === 'dept') && !deptUnder) {
            showToast('error', 'Validation Error', 'Department is required for Staff/Dept Head.');
            return;
        }

        setLoading(true);
        try {
            const payload = { fullName, email, uid, role, deptUnder: (role === 'staff' || role === 'dept') ? deptUnder : undefined };
            const response = await axiosPrivate.post('/users', payload);

            const { password, user } = response.data.data;

            Alert.alert(
                "User Created",
                `User ${user.fullName} created successfully.\nPassword: ${password}\n\n(This has also been emailed to them.)`,
                [{ text: "OK", onPress: () => navigation.goBack() }]
            );

            // Reset form
            setFullName(''); setEmail(''); setUid(''); setRole('student'); setDeptUnder('');

        } catch (error) {
            console.error("Create User Error", error);
            const msg = error.response?.data?.message || 'Failed to create user';
            showToast('error', 'Creation Failed', msg);
        } finally {
            setLoading(false);
        }
    };

    const handlePickFile = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['text/csv', 'application/vnd.ms-excel', 'text/comma-separated-values'],
                copyToCacheDirectory: true
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setSelectedFile(result.assets[0]);
                setBatchResults(null); // Clear previous results
            }
        } catch (err) {
            console.error("File pick error", err);
            showToast('error', 'Error', 'Failed to pick file');
        }
    };

    const handleBatchUpload = async () => {
        if (!selectedFile) {
            showToast('error', 'Missing File', 'Please select a CSV file first.');
            return;
        }

        setBatchLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', {
                uri: selectedFile.uri,
                name: selectedFile.name,
                type: selectedFile.mimeType || 'text/csv'
            });

            const response = await axiosPrivate.post('/users/batch', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setBatchResults(response.data.data); // { successCount, errors: [] }
            showToast('success', 'Batch Processed', `Created ${response.data.data.successCount} users.`);
            setSelectedFile(null);
        } catch (error) {
            console.error("Batch Creation Error", error);
            const msg = error.response?.data?.message || 'Batch upload failed';
            showToast('error', 'Batch Failed', msg);
        } finally {
            setBatchLoading(false);
        }
    };

    const SectionLabel = ({ text }) => <Text className="text-gray-500 font-bold uppercase text-xs mb-2 mt-4 ml-1">{text}</Text>;

    return (
        <SafeAreaView className="flex-1 bg-gray-50" style={{ paddingTop: Platform.OS === 'android' ? 20 : 0 }}>
            {/* Header */}
            <View className="px-5 py-4 bg-white border-b border-gray-100 flex-row items-center justify-between">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-gray-50 rounded-full">
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text className="font-bold text-lg text-gray-900">Create New User</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Tabs */}
            <View className="flex-row p-2 bg-white mb-2 shadow-sm">
                <TouchableOpacity
                    onPress={() => setActiveTab('single')}
                    className={`flex-1 py-3 items-center border-b-2 ${activeTab === 'single' ? 'border-black' : 'border-transparent'}`}
                >
                    <Text className={`font-bold ${activeTab === 'single' ? 'text-black' : 'text-gray-400'}`}>Single User</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('batch')}
                    className={`flex-1 py-3 items-center border-b-2 ${activeTab === 'batch' ? 'border-black' : 'border-transparent'}`}
                >
                    <Text className={`font-bold ${activeTab === 'batch' ? 'text-black' : 'text-gray-400'}`}>Batch Upload (CSV)</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-5 pt-2">
                {activeTab === 'single' ? (
                    <>
                        <SectionLabel text="Personal Information" />
                        <View className="bg-white p-4 rounded-xl border border-gray-100 mb-2">
                            <Text className="text-gray-400 text-xs mb-1">Full Name</Text>
                            <TextInput
                                value={fullName}
                                onChangeText={setFullName}
                                placeholder="e.g. John Doe"
                                className="text-base text-gray-900 font-medium border-b border-gray-100 pb-2 mb-3"
                            />

                            <Text className="text-gray-400 text-xs mb-1">Email Address</Text>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="e.g. john@university.edu"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                className="text-base text-gray-900 font-medium border-b border-gray-100 pb-2 mb-3"
                            />

                            <Text className="text-gray-400 text-xs mb-1">University ID (UID)</Text>
                            <TextInput
                                value={uid}
                                onChangeText={setUid}
                                placeholder="e.g. 20211011"
                                className="text-base text-gray-900 font-medium pb-1"
                            />
                        </View>

                        <SectionLabel text="Role & Details" />
                        <View className="flex-row flex-wrap mb-2">
                            {ROLES.map(r => (
                                <TouchableOpacity
                                    key={r}
                                    onPress={() => setRole(r)}
                                    className={`px-4 py-2 rounded-full mr-2 mb-2 border ${role === r ? 'bg-black border-black' : 'bg-white border-gray-200'}`}
                                >
                                    <Text className={`font-bold capitalize ${role === r ? 'text-white' : 'text-gray-600'}`}>{r === 'dept' ? 'Dept Head' : r}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {(role === 'staff' || role === 'dept') && (
                            <>
                                <SectionLabel text="Department" />
                                <View className="flex-row flex-wrap">
                                    {DEPARTMENTS.map(d => (
                                        <TouchableOpacity
                                            key={d}
                                            onPress={() => setDeptUnder(d)}
                                            className={`px-4 py-2 rounded-full mr-2 mb-2 border ${deptUnder === d ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}
                                        >
                                            <Text className={`font-bold ${deptUnder === d ? 'text-white' : 'text-gray-600'}`}>{d}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </>
                        )}

                        <TouchableOpacity
                            onPress={handleCreateSingle}
                            disabled={loading}
                            className="bg-black py-4 rounded-xl mt-8 mb-10 items-center justify-center shadow-lg"
                        >
                            {loading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Create User</Text>}
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <View className="bg-blue-50 p-4 rounded-xl mb-6 mt-4 border border-blue-100">
                            <Text className="text-blue-800 font-bold mb-2">CSV Format Instructions</Text>
                            <Text className="text-blue-600 text-sm leading-5">
                                Upload a CSV file with the following columns (headers required):
                            </Text>
                            <Text className="text-blue-800 font-mono text-xs mt-2 bg-blue-100 p-2 rounded">
                                fullName, email, uid, role, deptUnder
                            </Text>
                            <Text className="text-blue-500 text-xs mt-2 italic">
                                * Roles: student, staff, dept, admin
                            </Text>
                            <Text className="text-blue-500 text-xs italic">
                                * deptUnder required for staff/dept
                            </Text>
                        </View>

                        <View className="bg-white p-6 rounded-xl border border-gray-100 items-center justify-center h-48 mb-6 border-dashed border-2">
                            {selectedFile ? (
                                <View className="items-center">
                                    <Ionicons name="document-text" size={48} color="#2563eb" />
                                    <Text className="font-bold text-lg mt-2 text-gray-800">{selectedFile.name}</Text>
                                    <Text className="text-gray-500 text-sm">{(selectedFile.size / 1024).toFixed(1)} KB</Text>
                                    <TouchableOpacity onPress={() => setSelectedFile(null)} className="mt-4">
                                        <Text className="text-red-500 font-bold">Remove</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity onPress={handlePickFile} className="items-center w-full h-full justify-center">
                                    <Ionicons name="cloud-upload-outline" size={48} color="#9ca3af" />
                                    <Text className="text-gray-400 mt-2 font-medium">Tap to select CSV file</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        <TouchableOpacity
                            onPress={handleBatchUpload}
                            disabled={!selectedFile || batchLoading}
                            className={`py-4 rounded-xl items-center justify-center shadow-md ${!selectedFile ? 'bg-gray-300' : 'bg-black'}`}
                        >
                            {batchLoading ? <ActivityIndicator color="#fff" /> : <Text className="text-white font-bold text-lg">Upload & Create Users</Text>}
                        </TouchableOpacity>

                        {/* Batch Results */}
                        {batchResults && (
                            <View className="mt-6 mb-10">
                                <Text className="font-bold text-lg mb-2">Results</Text>
                                <View className="bg-green-50 p-4 rounded-lg border border-green-100 mb-2">
                                    <Text className="text-green-700 font-bold">Success: {batchResults.successCount} users created</Text>
                                </View>
                                {batchResults.errors && batchResults.errors.length > 0 && (
                                    <View className="bg-red-50 p-4 rounded-lg border border-red-100">
                                        <Text className="text-red-700 font-bold mb-2">Errors ({batchResults.errors.length})</Text>
                                        {batchResults.errors.map((err, idx) => (
                                            <Text key={idx} className="text-red-600 text-xs mb-1">• {err.email}: {err.error}</Text>
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}
                    </>
                )}

                {/* Bottom spacing */}
                <View className="h-20" />
            </ScrollView>
        </SafeAreaView>
    );
};

export default CreateUserScreen;
