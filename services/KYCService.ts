import apiClient from "./apiClient";
import { API_ENDPOINTS } from "@/configuration/api";
import type { KYCData } from "@/types/kyc";

/**
 * Service for KYC (Know Your Customer) related API calls.
 */
export const KYCService = {
  /**
   * Submits the user's KYC data to the server.
   * @param kycData The KYC data to submit.
   */
  submitKYC: async (kycData: KYCData): Promise<void> => {
    try {
      await apiClient.post(`${API_ENDPOINTS.KYC_CREATE}`, kycData);
    } catch (error) {
      console.error("Error submitting KYC data:", error);
      throw error;
    }
  },

  /**
   * Fetches the current KYC status for the authenticated user.
   */
  getKYCStatus: async (): Promise<any> => {
    try {
      return await apiClient.get(`${API_ENDPOINTS.KYC}/status`);
    } catch (error) {
      console.error("Error fetching KYC status:", error);
      throw error;
    }
  },
};
