import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, TextInput, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { axiosPrivate } from '../../api/axiosConfig';
import { Ionicons } from '@expo/vector-icons';
// import { debounce } from 'lodash'; // Removed to avoid dependency

const FeedScreen = ({ navigation }) => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Pagination & Search
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    const fetchIssues = async (pageToFetch = 1, query = '', shouldReset = false) => {
        try {
            if (shouldReset) setLoading(true);

            const limit = 10;
            const res = await axiosPrivate.get('/issues', {
                params: { page: pageToFetch, limit, search: query }
            });

            const newIssues = res.data.data.issues || [];

            if (shouldReset) {
                setIssues(newIssues);
            } else {
                setIssues(prev => [...prev, ...newIssues]);
            }

            setHasMore(newIssues.length === limit);
            setPage(pageToFetch);

        } catch (err) {
            console.log('Error fetching feed', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
            setIsFetchingMore(false);
        }
    };

    useEffect(() => {
        fetchIssues(1, '', true);
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchIssues(1, searchQuery, true);
    };

    const handleLoadMore = () => {
        if (!hasMore || isFetchingMore || loading) return;
        setIsFetchingMore(true);
        fetchIssues(page + 1, searchQuery, false);
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
        // Basic debounce could be added here if desired, otherwise explicit search button or live search
        // For simplicity, we'll trigger simple live search here but ideally debounce it
    };

    // Submitting search on finish editing to avoid too many requests
    const onSearchSubmit = () => {
        fetchIssues(1, searchQuery, true);
    };

    const toggleVote = async (issueId, type) => {
        // Optimistic Update
        const updatedIssues = issues.map(i => {
            if (i._id === issueId) {
                const currentUpvoted = i.voteState?.upvoted;
                const currentDownvoted = i.voteState?.downvoted;
                let newUpvotes = i.voteCounts?.upvotes || 0;
                let newDownvotes = i.voteCounts?.downvotes || 0;
                let newUpvoted = currentUpvoted;
                let newDownvoted = currentDownvoted;

                if (type === 'up') {
                    if (currentUpvoted) {
                        newUpvotes--;
                        newUpvoted = false;
                    } else {
                        newUpvotes++;
                        newUpvoted = true;
                        if (currentDownvoted) {
                            newDownvotes--;
                            newDownvoted = false;
                        }
                    }
                } else {
                    if (currentDownvoted) {
                        newDownvotes--;
                        newDownvoted = false;
                    } else {
                        newDownvotes++;
                        newDownvoted = true;
                        if (currentUpvoted) {
                            newUpvotes--;
                            newUpvoted = false;
                        }
                    }
                }

                return {
                    ...i,
                    voteState: { upvoted: newUpvoted, downvoted: newDownvoted },
                    voteCounts: { upvotes: newUpvotes, downvotes: newDownvotes }
                };
            }
            return i;
        });
        setIssues(updatedIssues);

        try {
            await axiosPrivate.post(`/issues/${issueId}/${type === 'up' ? 'upvote' : 'downvote'}`);
        } catch (err) {
            console.error("Vote failed", err);
            fetchIssues(page, searchQuery, true); // Revert silently or refresh
        }
    };

    const StatusBadge = ({ status }) => {
        let bg = 'bg-gray-100';
        let text = 'text-gray-600';
        const s = status?.toLowerCase() || '';

        if (s.includes('resolved') || s.includes('completed')) { bg = 'bg-green-100'; text = 'text-green-700'; }
        else if (s.includes('progress')) { bg = 'bg-blue-100'; text = 'text-blue-700'; }
        else if (s.includes('not started') || s.includes('pending')) { bg = 'bg-yellow-100'; text = 'text-yellow-700'; }

        return (
            <View className={`px-3 py-1.5 rounded-full ${bg}`}>
                <Text className={`text-[10px] font-bold uppercase ${text}`}>{status || 'Pending'}</Text>
            </View>
        );
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity
            onPress={() => navigation.navigate('ComplaintDetail', { issue: item })}
            activeOpacity={0.8}
            className="bg-white mb-5 mx-4 rounded-3xl shadow-md border border-gray-100 overflow-hidden"
        >
            {/* Title & Status Row */}
            <View className="px-5 pt-4 pb-2 flex-row justify-between items-start">
                <Text className="text-lg font-extrabold text-gray-900 leading-tight flex-1 mr-3">
                    {item.title}
                </Text>
                <StatusBadge status={item.status} />
            </View>

            {/* Media (Full Width) */}
            {item.issuerMedia && item.issuerMedia.length > 0 && item.issuerMedia[0].type === 'image' && (
                <View className="mt-2">
                    <Image
                        source={{ uri: item.issuerMedia[0].url }} // Cloudinary URLs are absolute
                        className="w-full h-56 bg-gray-50"
                        resizeMode="cover"
                    />
                </View>
            )}

            {/* Footer: Votes */}
            <View className="px-4 py-3 bg-white">
                <View className="flex-row items-center bg-gray-50 rounded-full px-3 py-1.5 self-start shadow-sm border border-gray-100">
                    <TouchableOpacity
                        onPress={() => toggleVote(item._id, 'up')}
                        className="p-1"
                    >
                        <Ionicons
                            name={item.voteState?.upvoted ? "thumbs-up" : "thumbs-up-outline"}
                            size={20}
                            color={item.voteState?.upvoted ? "#ef4444" : "#64748b"}
                        />
                    </TouchableOpacity>

                    <Text className={`font-bold mx-3 text-base ${item.voteState?.upvoted ? 'text-red-500' : (item.voteState?.downvoted ? 'text-blue-500' : 'text-gray-700')}`}>
                        {(item.voteCounts?.upvotes || 0) - (item.voteCounts?.downvotes || 0)}
                    </Text>

                    <TouchableOpacity
                        onPress={() => toggleVote(item._id, 'down')}
                        className="p-1"
                    >
                        <Ionicons
                            name={item.voteState?.downvoted ? "thumbs-down" : "thumbs-down-outline"}
                            size={20}
                            color={item.voteState?.downvoted ? "#3b82f6" : "#64748b"}
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View className="px-4 py-4">
                {/* Search Bar */}
                <View className="flex-row items-center bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm mb-2">
                    <Ionicons name="search" size={20} color="#9ca3af" />
                    <TextInput
                        placeholder="Search issues..."
                        placeholderTextColor="#9ca3af"
                        className="flex-1 ml-3 text-base text-gray-900"
                        value={searchQuery}
                        onChangeText={handleSearch}
                        onSubmitEditing={onSearchSubmit}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => { setSearchQuery(''); fetchIssues(1, '', true); }}>
                            <Ionicons name="close-circle" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {loading && !refreshing && page === 1 ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            ) : (
                <FlatList
                    data={issues}
                    renderItem={renderItem}
                    keyExtractor={item => item._id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    contentContainerStyle={{ paddingBottom: 140 }}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.5}
                    ListFooterComponent={isFetchingMore && <ActivityIndicator className="py-4" color="#2563eb" />}
                    ListEmptyComponent={<Text className="text-center text-gray-400 mt-10">No issues found.</Text>}
                />
            )}
        </SafeAreaView>
    );
};

export default FeedScreen;
