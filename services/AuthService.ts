import apiClient from './apiClient';
import { API_ENDPOINTS } from '@/configuration/api';
import type { User } from '@/types';
import * as SecureStore from 'expo-secure-store';

interface RegisterData {
  email: string;
  password: string;
  FirstName: string;
  LastName: string;
  phone: string;
  country: string;
}

// Define the possible return types for the login function
type LoginResult =
  | { user: User; token: string; requiresTwoFactor?: false }
  | { requiresTwoFactor: true; tempToken: string };

// Define the return type for the 2FA verification
type Verify2FAResult = {
  user: User;
  token: string;
};

export const AuthService = {
  login: async (email: string, password: string): Promise<LoginResult> => {
    // The API is expected to return a body that matches LoginResult
    const response = await apiClient.post<LoginResult>(API_ENDPOINTS.LOGIN, { email, password });

    if (response.requiresTwoFactor) {
      return { requiresTwoFactor: true, tempToken: response.tempToken };
    }

    // If 2FA is not required, we get a final auth token directly
    await SecureStore.setItemAsync('auth_token', response.token);
    return response;
  },

  verify2FA: async (tempToken: string, code: string): Promise<Verify2FAResult> => {
    const response = await apiClient.post<Verify2FAResult>(API_ENDPOINTS.VERIFY_2FA, { tempToken, code });
    // On successful verification, store the final auth token
    await SecureStore.setItemAsync('auth_token', response.token);
    return response;
  },

  setup2FA: async (): Promise<{ secret: string; qrCodeURL: string }> => {
    // This endpoint returns a new secret and a QR code URL for the user to scan
    return await apiClient.get(API_ENDPOINTS.SETUP_2FA);
  },

  enable2FA: async (code: string): Promise<void> => {
    // This endpoint verifies the code against the temporary secret and enables 2FA for the user
    return await apiClient.post(API_ENDPOINTS.ENABLE_2FA, { code });
  },

  register: async (userData: RegisterData): Promise<{ token: string; user: User }> => {
    return await apiClient.post(API_ENDPOINTS.REGISTER, userData);
  },

  logout: async (): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.LOGOUT, {});
    // Also remove the token from storage on logout
    await SecureStore.deleteItemAsync('auth_token');
  },

  fetchUserProfile: async (): Promise<User> => {
    return await apiClient.get(API_ENDPOINTS.PROFILE);
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    return await apiClient.put(API_ENDPOINTS.PROFILE, data);
  },

  uploadAvatar: async (imageUri: string): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);
    return await apiClient.postFormData('/users/avatar', formData);
  },
};
