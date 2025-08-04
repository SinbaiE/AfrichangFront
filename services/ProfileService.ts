import apiClient from "./apiClient";
import { API_ENDPOINTS } from "@/configuration/api";
import type { UserSettings } from "@/types";

/**
 * Service for user profile and settings API calls.
 */
export const ProfileService = {
  /**
   * Fetches the settings for the authenticated user.
   */
  getUserSettings: async (): Promise<UserSettings> => {
    return apiClient.get(API_ENDPOINTS.USER_SETTINGS);
  },

  /**
   * Updates the settings for the authenticated user.
   */
  updateUserSettings: async (settingsData: Partial<UserSettings>): Promise<UserSettings> => {
    return apiClient.put(API_ENDPOINTS.USER_SETTINGS, settingsData);
  },

  /**
   * Fetches profile statistics for the user.
   */
  getProfileStats: async (): Promise<any> => {
    return apiClient.get(API_ENDPOINTS.PROFILE_STATS);
  },

  /**
   * Requests an export of the user's data.
   */
  exportUserData: async (): Promise<any> => {
    return apiClient.post(API_ENDPOINTS.EXPORT_USER_DATA, {});
  },

  /**
   * Deletes the user's account.
   */
  deleteUserAccount: async (): Promise<void> => {
    return apiClient.delete(API_ENDPOINTS.DELETE_USER_ACCOUNT);
  },
};
