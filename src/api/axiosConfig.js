import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// CONST BASE_URL = 'https://fixup-backend-x2ja.onrender.com/api/v1'; // Production
const BASE_URL = 'http://10.156.104.126:5000/api/v1'; // Local Testing

export const axiosPublic = axios.create({
    baseURL: BASE_URL,
});

export const axiosPrivate = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

// Request Interceptor: Attach Token
axiosPrivate.interceptors.request.use(
    async (config) => {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            // Also set as Cookie header since backend often checks cookies
            // Note: 'Cookie' header is sometimes restricted in browsers but OK in React Native
            config.headers.Cookie = `accessToken=${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Refresh Token
axiosPrivate.interceptors.response.use(
    (response) => response,
    async (error) => {
        const prevRequest = error?.config;
        if (error?.response?.status === 401 && !prevRequest?._retry) {
            prevRequest._retry = true;
            try {
                // Attempt refresh
                const response = await axiosPublic.post('/users/refresh', {}, { withCredentials: true });
                // Assuming backend returns new access token in data.accessToken or sets cookie
                // If it returns a token:
                const newAccessToken = response.data?.accessToken || response.data?.data?.accessToken;

                if (newAccessToken) {
                    await SecureStore.setItemAsync('accessToken', newAccessToken);
                    prevRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return axiosPrivate(prevRequest);
                }
                // If backend only sets cookie, we just retry
                return axiosPrivate(prevRequest);
            } catch (refreshError) {
                // Refresh failed, logout user (handled by AuthContext state usually, or reject)
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);
