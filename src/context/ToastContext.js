import React, { createContext, useState, useContext, useCallback, useRef, useEffect } from 'react';
import { View, Text, Animated, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success', title: '' });
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(-100)).current;
    const insets = useSafeAreaInsets();
    const timeoutRef = useRef(null);

    const showToast = useCallback((type, title, message, duration = 3000) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        setToast({ visible: true, message, type, title });

        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(translateY, {
                toValue: 0,
                speed: 12,
                bounciness: 8,
                useNativeDriver: true,
            })
        ]).start();

        timeoutRef.current = setTimeout(() => {
            hideToast();
        }, duration);
    }, []);

    const hideToast = useCallback(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: -100, // slide up
                duration: 200,
                useNativeDriver: true,
            })
        ]).start(() => {
            setToast(prev => ({ ...prev, visible: false }));
        });
    }, []);

    const getColors = () => {
        switch (toast.type) {
            case 'success': return { bg: 'bg-green-500', icon: 'checkmark-circle' };
            case 'error': return { bg: 'bg-red-500', icon: 'alert-circle' };
            case 'info': return { bg: 'bg-blue-500', icon: 'information-circle' };
            case 'warning': return { bg: 'bg-orange-500', icon: 'warning' };
            default: return { bg: 'bg-gray-800', icon: 'notifications' };
        }
    };

    const styles = getColors();

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}
            {toast.visible && (
                <Animated.View
                    style={{
                        position: 'absolute',
                        top: insets.top + (Platform.OS === 'android' ? 10 : 0),
                        left: 16,
                        right: 16,
                        zIndex: 9999,
                        opacity: fadeAnim,
                        transform: [{ translateY }],
                    }}
                >
                    <View className={`rounded-2xl shadow-lg shadow-gray-300 flex-row items-center p-4 ${styles.bg}`}>
                        <View className="bg-white/20 p-2 rounded-full mr-3">
                            <Ionicons name={styles.icon} size={24} color="white" />
                        </View>
                        <View className="flex-1">
                            {toast.title && <Text className="text-white font-bold text-base mb-0.5">{toast.title}</Text>}
                            <Text className="text-white text-sm font-medium leading-4 opacity-90">{toast.message}</Text>
                        </View>
                        <TouchableOpacity onPress={hideToast} className="p-1">
                            <Ionicons name="close" size={20} color="white" style={{ opacity: 0.8 }} />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            )}
        </ToastContext.Provider>
    );
};
