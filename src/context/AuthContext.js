import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { axiosPrivate, axiosPublic } from '../api/axiosConfig';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Login Function
    const login = async (email, password) => {
        try {
            // The backend returns cookies but NOT in the JSON body. We must extract from headers.
            // Note: React Native axios might allow accessing headers.
            const response = await axiosPublic.post('/users/login', { email, password });

            const { user } = response.data.data;

            // Extract cookies manually
            const setCookieHeaders = response.headers['set-cookie'];
            let accessToken = null;
            let refreshToken = null;

            if (setCookieHeaders) {
                setCookieHeaders.forEach(cookie => {
                    if (cookie.includes('accessToken=')) {
                        accessToken = cookie.split('accessToken=')[1].split(';')[0];
                    }
                    if (cookie.includes('refreshToken=')) {
                        refreshToken = cookie.split('refreshToken=')[1].split(';')[0];
                    }
                });
            }

            console.log('Login Success. Token found:', !!accessToken);

            if (accessToken) {
                await SecureStore.setItemAsync('accessToken', accessToken);
                // We'll also store it for axios interceptors to plain read
            } else {
                console.warn("No accessToken found in headers. If backend is httpOnly, RN might not see it explicitly without cookie manager. Proceeding with Auth User state.");
            }

            setUser(user);
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);
            throw error;
        }
    };

    // Logout Function
    const logout = async () => {
        try {
            await axiosPrivate.post('/users/logout');
        } catch (err) {
            console.log('Logout API error', err);
        } finally {
            await SecureStore.deleteItemAsync('accessToken');
            setUser(null);
        }
    };

    // Restore Session
    const restoreSession = async () => {
        try {
            // Verify token or get user profile
            const token = await SecureStore.getItemAsync('accessToken');
            if (token) {
                const res = await axiosPrivate.get("/users/me");
                const restoredUser = res.data.data.user;
                setUser(restoredUser);
            }
        } catch (err) {
            console.log("Session restore failed", err);
            // Token might be invalid
            await SecureStore.deleteItemAsync('accessToken');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        restoreSession();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
