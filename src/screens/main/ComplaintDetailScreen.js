import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Platform, Modal, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { axiosPrivate } from '../../api/axiosConfig';

import { useContext, useCallback, useState, useEffect } from 'react'; // Consolidated imports
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext'; // Use Toast
import ImageView from "react-native-image-viewing";

const ComplaintDetailScreen = ({ route, navigation }) => {
    const { user } = useContext(AuthContext);
    const { issue: initialIssue } = route.params;
    const [issue, setIssue] = useState(initialIssue);
    const { showToast } = useToast(); // Use Toast

    // Feedback State
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState("");

    // Report State
    const [reportModalVisible, setReportModalVisible] = useState(false);

    // Gallery State
    const [isGalleryVisible, setIsGalleryVisible] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [galleryImages, setGalleryImages] = useState([]);

    const handleImagePress = (mediaArray, index) => {
        const images = mediaArray
            .filter(item => item.type === 'image')
            .map(item => ({ uri: item.url }));

        setGalleryImages(images);
        setCurrentImageIndex(index);
        setIsGalleryVisible(true);
    };

    const fetchIssueDetails = async () => {
        try {
            const response = await axiosPrivate.get(`/issues/${initialIssue._id}`);
            if (response.data.success) {
                setIssue(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch details", error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchIssueDetails();
        }, [])
    );

    const submitFeedback = async () => {
        if (!newComment.trim()) return;
        try {
            const response = await axiosPrivate.post(`/issues/${issue._id}/feedback`, {
                rating: newRating,
                comment: newComment
            });
            // Response contains updated issue
            setIssue(response.data.data);
            setNewComment("");
            setNewRating(5);
            showToast("success", "Review Added", "Thanks for your feedback!");
        } catch (error) {
            showToast("error", "Failed", error.response?.data?.message || "Could not add review");
        }
    };

    const submitReport = async (reason) => {
        try {
            await axiosPrivate.post(`/reports`, {
                issueId: issue._id,
                reason: reason
            });
            setReportModalVisible(false);
            showToast("success", "Reported", "Issue has been flagged for review.");
        } catch (error) {
            setReportModalVisible(false);
            showToast("error", "Failed", error.response?.data?.message || "Could not report issue");
        }
    };

    const toggleUpvote = async () => {
        // Optimistic update
        const wasUpvoted = issue.voteState?.upvoted;
        const newCount = (issue.voteCounts?.upvotes || 0) + (wasUpvoted ? -1 : 1);

        setIssue(prev => ({
            ...prev,
            voteState: { ...prev.voteState, upvoted: !wasUpvoted },
            voteCounts: { ...prev.voteCounts, upvotes: newCount }
        }));

        try {
            await axiosPrivate.post(`/issues/${issue._id}/upvote`);
            fetchIssueDetails(); // Sync with server for accuracy
        } catch (error) {
            console.error("Upvote failed", error);
        }
    };

    useEffect(() => {
        fetchIssueDetails();
    }, []);

    const StatusBadge = ({ status }) => {
        let bg = 'bg-gray-100';
        let text = 'text-gray-600';

        const s = status?.toLowerCase() || '';
        if (s.includes('resolved') || s.includes('completed')) { bg = 'bg-green-100'; text = 'text-green-700'; }
        else if (s.includes('progress')) { bg = 'bg-blue-100'; text = 'text-blue-700'; }
        else if (s.includes('not started') || s.includes('pending')) { bg = 'bg-yellow-100'; text = 'text-yellow-700'; }

        return (
            <View className={`px-3 py-1.5 rounded-full ${bg}`}>
                <Text className={`font-bold text-xs uppercase ${text}`}>{status || 'Pending'}</Text>
            </View>
        );
    };

    const SectionHeader = ({ title, icon }) => (
        <View className="flex-row items-center mb-3 mt-6">
            <Ionicons name={icon} size={18} color="#2563eb" />
            <Text className="text-gray-900 font-bold text-lg ml-2">{title}</Text>
        </View>
    );

    const InfoRow = ({ label, value }) => (
        <View className="flex-row justify-between py-2 border-b border-gray-50">
            <Text className="text-gray-500 font-medium">{label}</Text>
            <Text className="text-gray-900 font-medium flex-1 text-right ml-4" numberOfLines={1}>{value || '-'}</Text>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-white" style={{ paddingTop: Platform.OS === 'android' ? 60 : 0 }}>
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 bg-gray-50 rounded-full">
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text className="font-bold text-lg text-gray-800">Issue Details</Text>

                <View className="flex-row">
                    <TouchableOpacity
                        onPress={() => setReportModalVisible(true)}
                        className="p-2 bg-red-50 rounded-full mr-2"
                    >
                        <Ionicons name="flag-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>

                    {(user?.role === 'admin' || (user?.role === 'dept' && user?.deptUnder === issue.department)) && (
                        <View className="flex-row">
                            <TouchableOpacity
                                onPress={() => navigation.navigate('AssignStaff', { issue })}
                                className="p-2 bg-purple-50 rounded-full mr-2"
                            >
                                <Ionicons name="person-add" size={20} color="#9333ea" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => navigation.navigate('EditIssue', { issue })}
                                className="p-2 bg-blue-50 rounded-full"
                            >
                                <Ionicons name="pencil" size={20} color="#2563eb" />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            <ScrollView className="flex-1 px-5 pt-4" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* ... Header Info, Title, Location, Description, Meta Data ... */}

                <View className="flex-row justify-between items-start mb-4">
                    <StatusBadge status={issue.status} />
                    <View className="bg-red-50 px-3 py-1.5 rounded-full border border-red-100">
                        <Text className="text-red-600 text-xs font-bold uppercase">{issue.priority || 'Normal'}</Text>
                    </View>
                </View>

                <Text className="text-2xl font-extrabold text-gray-900 mb-2 leading-tight tracking-tight">
                    {issue.title}
                </Text>

                <View className="flex-row items-center space-x-2 mb-6">
                    <Ionicons name="location-outline" size={16} color="#6b7280" />
                    <Text className="text-gray-500 text-sm font-medium">
                        {issue.location || 'Unknown Location'} • {new Date(issue.createdAt).toLocaleDateString()}
                    </Text>
                </View>

                {/* Main Description */}
                <View className="bg-gray-50 p-5 rounded-2xl mb-2">
                    <Text className="text-gray-800 text-base leading-7">{issue.description}</Text>
                </View>

                {/* Primary Meta Data */}
                <View className="bg-white rounded-2xl mb-2">
                    <InfoRow label="Department" value={issue.department} />
                    <InfoRow label="Reported By" value={issue.issueUploader?.fullName} />
                    <InfoRow label="Assigned To" value={issue.staffAssigned?.fullName || "Unassigned"} />
                </View>

                {/* Media Section */}
                {(issue.issuerMedia?.length > 0 || issue.resolverMedia?.length > 0) && (
                    <View>
                        <SectionHeader title="Attachments" icon="images-outline" />
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
                            {issue.issuerMedia?.map((media, index) => (
                                <TouchableOpacity
                                    key={`issuer-${index}`}
                                    onPress={() => handleImagePress(issue.issuerMedia, index)}
                                    activeOpacity={0.9}
                                    className="mr-3"
                                >
                                    <Image
                                        source={{ uri: media.url }}
                                        className="w-64 h-48 rounded-xl bg-gray-200 border border-gray-100"
                                        resizeMode="cover"
                                    />
                                </TouchableOpacity>
                            ))}
                            {issue.resolverMedia?.map((media, index) => (
                                <View key={`resolver-${index}`} className="relative mr-3">
                                    <TouchableOpacity
                                        onPress={() => handleImagePress(issue.resolverMedia, index)}
                                        activeOpacity={0.9}
                                    >
                                        <Image
                                            source={{ uri: media.url }}
                                            className="w-64 h-48 rounded-xl bg-gray-200 border border-green-200"
                                            resizeMode="cover"
                                        />
                                    </TouchableOpacity>
                                    <View className="absolute bottom-2 right-2 bg-green-500 px-2 py-1 rounded">
                                        <Text className="text-white text-xs font-bold">Resolver</Text>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
                )}

                {/* Remarks Section ... */}
                {(issue.staffRemarks || issue.authorityRemarks || issue.adminRemarks) && (
                    <View className="mb-6">
                        <SectionHeader title="Official Remarks" icon="chatbubble-ellipses-outline" />
                        {issue.staffRemarks && (
                            <View className="bg-blue-50 p-4 rounded-xl mb-2 border border-blue-100">
                                <Text className="text-blue-800 font-bold text-xs mb-1 uppercase">Staff Remarks</Text>
                                <Text className="text-gray-800">{issue.staffRemarks}</Text>
                            </View>
                        )}
                        {issue.adminRemarks && (
                            <View className="bg-purple-50 p-4 rounded-xl mb-2 border border-purple-100">
                                <Text className="text-purple-800 font-bold text-xs mb-1 uppercase">Admin Remarks</Text>
                                <Text className="text-gray-800">{issue.adminRemarks}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* --- FEEDBACK SECTION --- */}
                <View className="mb-8 border-t border-gray-100 pt-6">
                    <SectionHeader title="Reviews & Feedback" icon="star-outline" />

                    {/* Add Feedback Form */}
                    <View className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100">
                        <Text className="font-bold text-gray-700 mb-2">Write a Review</Text>
                        <View className="flex-row mb-3">
                            {[1, 2, 3, 4, 5].map(star => (
                                <TouchableOpacity key={star} onPress={() => setNewRating(star)}>
                                    <Ionicons
                                        name={star <= newRating ? "star" : "star-outline"}
                                        size={24}
                                        color="#f59e0b"
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <TextInput
                            value={newComment}
                            onChangeText={setNewComment}
                            placeholder="Share your experience..."
                            multiline
                            className="bg-white border border-gray-200 rounded-lg p-3 min-h-[80px] mb-3"
                            textAlignVertical="top"
                        />
                        <TouchableOpacity
                            onPress={submitFeedback}
                            className={`py-3 rounded-lg flex-row justify-center ${!newComment.trim() ? 'bg-gray-300' : 'bg-blue-600'}`}
                            disabled={!newComment.trim()}
                        >
                            <Text className="text-white font-bold">Submit Review</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Feedback List Removed per user request */}
                    <Text className="text-gray-400 text-center italic text-xs">Recent reviews are visible to admins.</Text>
                </View>

                {/* Additional Padding for Sticky Bar */}
                <View className="h-20" />
            </ScrollView>

            <ImageView
                images={galleryImages}
                imageIndex={currentImageIndex}
                visible={isGalleryVisible}
                onRequestClose={() => setIsGalleryVisible(false)}
            />

            {/* Sticky Vote Bar */}
            <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 shadow-2xl">
                <TouchableOpacity
                    onPress={toggleUpvote}
                    activeOpacity={0.8}
                    className={`flex-row items-center justify-center py-4 rounded-xl ${issue.voteState?.upvoted ? 'bg-primary' : 'bg-gray-100'}`}
                >
                    <Ionicons
                        name={issue.voteState?.upvoted ? "thumbs-up" : "thumbs-up-outline"}
                        size={24}
                        color={issue.voteState?.upvoted ? "white" : "#4b5563"}
                    />
                    <Text className={`font-bold text-lg ml-2 ${issue.voteState?.upvoted ? "text-white" : "text-gray-700"}`}>
                        {issue.voteCounts?.upvotes || 0} Upvotes
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Report Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={reportModalVisible}
                onRequestClose={() => setReportModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl p-6 h-[50%]">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-xl font-bold text-red-600">Report Issue</Text>
                            <TouchableOpacity onPress={() => setReportModalVisible(false)}>
                                <Ionicons name="close-circle" size={30} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-600 mb-4">Why are you reporting this issue?</Text>

                        <ScrollView className="mb-4">
                            {['Spam', 'Inappropriate Content', 'Fake Issue', 'Information Wrong', 'Other'].map((r) => (
                                <TouchableOpacity
                                    key={r}
                                    onPress={() => submitReport(r)}
                                    className="bg-gray-50 p-4 rounded-xl mb-2 border border-gray-100"
                                >
                                    <Text className="font-bold text-gray-700">{r}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default ComplaintDetailScreen;
