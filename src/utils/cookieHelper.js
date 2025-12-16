// Helper to get raw cookie string from SecureStore and format for headers
import * as SecureStore from 'expo-secure-store';

export const getAuthCookies = async () => {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    // If we had refresh token, we'd add it too.
    return accessToken ? `accessToken=${accessToken}` : '';
};
