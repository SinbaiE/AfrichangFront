import apiClient from './apiClient';
import { API_ENDPOINTS } from '@/configuration/api';
import type { User } from '@/types';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
}

export const AuthService = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    try {
      // apiClient.post now returns the JSON data directly
      return await apiClient.post(API_ENDPOINTS.LOGIN, { email, password });
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },


  register: async (userData: RegisterData): Promise<{ token: string; user: User }> => {
    return await apiClient.post(API_ENDPOINTS.REGISTER, userData);
  },

  logout: async (): Promise<void> => {
    return await apiClient.post(API_ENDPOINTS.LOGOUT, {});
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
