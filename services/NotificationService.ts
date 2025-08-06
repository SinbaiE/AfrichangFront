import apiClient from "./apiClient";
import { API_ENDPOINTS } from "@/configuration/api";

interface NotificationData {
  id: string;
  title: string;
  body: string;
  data?: any;
  timestamp: number;
  read: boolean;
  type: "kyc" | "transaction" | "exchange" | "security" | "general";
  priority: "low" | "normal" | "high";
}

/**
 * Service for handling notifications.
 */
export const NotificationService = {
  /**
   * Fetches all notifications for the authenticated user.
   */
  getNotifications: async (): Promise<{ notifications: NotificationData[] }> => {
    try {
      return await apiClient.get(API_ENDPOINTS.NOTIFICATIONS);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw { notifications: [] }; // Return a default value on error
    }
  },

  /**
   * Registers the Expo push token with the backend server.
   * @param token The Expo push token.
   */
  registerPushToken: async (token: string): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.NOTIFICATIONS_REGISTER, { token });
    } catch (error) {
      console.error("Error registering push token:", error);
      // Don't throw here, as it might break the notification setup flow
    }
  },
};
