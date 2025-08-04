import apiClient from "./apiClient";
import { API_ENDPOINTS } from "@/configuration/api";
import type { Withdrawal } from "@/types";

/**
 * Service for handling withdrawal requests.
 */
export const WithdrawalService = {
  /**
   * Creates a new withdrawal request.
   */
  createWithdrawal: async (withdrawalData: any): Promise<Withdrawal> => {
    return apiClient.post(API_ENDPOINTS.WITHDRAWALS, withdrawalData);
  },

  /**
   * Lists all withdrawals for a specific user.
   */
  getWithdrawalsByUser: async (userId: string): Promise<Withdrawal[]> => {
    return apiClient.get(API_ENDPOINTS.WITHDRAWALS_BY_USER(userId));
  },

  /**
   * Updates the status of a withdrawal (for admin use).
   */
  updateWithdrawalStatus: async (withdrawalId: string, status: string): Promise<Withdrawal> => {
    return apiClient.put(API_ENDPOINTS.UPDATE_WITHDRAWAL_STATUS(withdrawalId), { status });
  },
};
