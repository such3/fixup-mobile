import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const AnimatedTrophyIcon = ({ onPress }) => {
    const scaleValue = useRef(new Animated.Value(1)).current;
    const rotateValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Continuous gentle pulse animation
        const pulse = Animated.sequence([
            Animated.timing(scaleValue, {
                toValue: 1.2,
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(scaleValue, {
                toValue: 1.0,
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            })
        ]);

        // Occasional wiggle
        const wiggle = Animated.sequence([
            Animated.timing(rotateValue, {
                toValue: 1, // 15 degrees
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(rotateValue, {
                toValue: -1, // -15 degrees
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(rotateValue, {
                toValue: 0,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.delay(3000)
        ]);

        Animated.loop(pulse).start();
        Animated.loop(wiggle).start();

    }, []);

    const rotate = rotateValue.interpolate({
        inputRange: [-1, 1],
        outputRange: ['-15deg', '15deg']
    });

    return (
        <TouchableOpacity onPress={onPress} style={{ marginRight: 16 }}>
            <Animated.View style={{ transform: [{ scale: scaleValue }, { rotate }] }}>
                <Ionicons name="trophy" size={26} color="#fbbf24" />
                {/* #fbbf24 is a nice amber/gold color */}
            </Animated.View>
        </TouchableOpacity>
    );
};

export default AnimatedTrophyIcon;
