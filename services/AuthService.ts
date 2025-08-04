import apiClient from "./apiClient";
import { API_ENDPOINTS } from "@/configuration/api";
import type { User } from "@/types";

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  country: string;
}

/**
 * Service for authentication-related API calls.
 * All methods now use the fetch-based apiClient.
 */
export const AuthService = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
      // apiClient.post now returns the JSON data directly
      return await apiClient.post(API_ENDPOINTS.LOGIN, { email, password });
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  register: async (userData: RegisterData): Promise<{ token: string; user: User }> => {
    try {
      return await apiClient.post(API_ENDPOINTS.REGISTER, userData);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.LOGOUT, {});
    } catch (error) {
      console.error("Logout error:", error);
      // It's often safe to ignore logout errors
    }
  },

  fetchUserProfile: async (): Promise<User> => {
    try {
      return await apiClient.get(API_ENDPOINTS.PROFILE);
    } catch (error) {
      console.error("Fetch user profile error:", error);
      throw error;
    }
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    try {
      return await apiClient.put(API_ENDPOINTS.PROFILE, data);
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  },

  uploadAvatar: async (imageUri: string): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append("avatar", {
      uri: imageUri,
      type: "image/jpeg",
      name: "avatar.jpg",
    } as any);

    try {
      // Use the dedicated method for form-data
      return await apiClient.postFormData("/users/avatar", formData);
    } catch (error) {
      console.error("Upload avatar error:", error);
      throw error;
    }
  },
};
