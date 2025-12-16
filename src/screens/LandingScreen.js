import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const LandingScreen = () => {
    // Animation Values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            })
        ]).start();
    }, []);

    return (
        <SafeAreaView className="flex-1 bg-blue-600 justify-center items-center">

            <Animated.View
                style={{
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                }}
                className="items-center"
            >
                {/* Logo Icon */}
                <View className="bg-white p-6 rounded-full shadow-2xl mb-4">
                    <Ionicons name="construct" size={64} color="#2563eb" />
                </View>

                {/* App Name */}
                <Animated.Text
                    style={{ transform: [{ translateY: slideAnim }] }}
                    className="text-5xl font-extrabold text-white tracking-tighter"
                >
                    FixUp
                </Animated.Text>

                {/* Tagline */}
                <Animated.Text
                    style={{ opacity: fadeAnim }}
                    className="text-blue-100 text-lg font-medium mt-2"
                >
                    Resolve Issues. Fast.
                </Animated.Text>
            </Animated.View>

            {/* Bottom Loader */}
            <View className="absolute bottom-20">
                <ActivityIndicatorDot />
            </View>

        </SafeAreaView>
    );
};

// Simple custom dot loader
const ActivityIndicatorDot = () => {
    const dotAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(dotAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(dotAnim, { toValue: 0, duration: 800, useNativeDriver: true })
            ])
        ).start();
    }, []);

    return (
        <Animated.View style={{ opacity: dotAnim }}>
            <Text className="text-white text-xs tracking-[4px]">LOADING...</Text>
        </Animated.View>
    );
};

export default LandingScreen;
