import apiClient from "./apiClient";
import { API_ENDPOINTS } from "@/configuration/api";
import type { Deposit } from "@/types";

/**
 * Service for deposit-related API calls.
 */
export const DepositService = {
  /**
   * Fetches the deposit history for a user.
   */
  getUserDeposits: async (userId: string): Promise<Deposit[]> => {
    return apiClient.get(`${API_ENDPOINTS.DEPOSITS}/${userId}`);
  },

  /**
   * Creates a new deposit request.
   */
  createDeposit: async (userId: string, depositData: any): Promise<Deposit> => {
    return apiClient.post(`${API_ENDPOINTS.DEPOSITS}/${userId}`, depositData);
  },

  /**
   * Fetches the available payment methods for deposits.
   */
  getPaymentMethods: async (): Promise<any[]> => {
    return apiClient.get(`${API_ENDPOINTS.DEPOSITS}/payment-methods`);
  },

  /**
   * Fetches the details of a specific deposit.
   */
  getDepositDetails: async (depositId: string): Promise<Deposit> => {
    return apiClient.get(`${API_ENDPOINTS.DEPOSITS}/${depositId}/users`);
  },

  /**
   * Cancels a pending deposit.
   */
  cancelDeposit: async (depositId: string): Promise<void> => {
    return apiClient.put(`${API_ENDPOINTS.DEPOSITS}/${depositId}/cancel`, {});
  },
};
