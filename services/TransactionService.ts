import apiClient from "./apiClient";
import { API_ENDPOINTS } from "@/configuration/api";
import type { Transaction } from "@/types";

interface TransferData {
  receiverEmail: string;
  amount: number;
  currency: string;
  description?: string;
}

/**
 * Service for handling financial transactions.
 */
export const TransactionService = {
  /**
   * Fetches the transaction history for the authenticated user.
   */
  getUserTransactions: async (): Promise<Transaction[]> => {
    try {
      return await apiClient.get(API_ENDPOINTS.TRANSACTIONS);
    } catch (error) {
      console.error("Error fetching user transactions:", error);
      throw error;
    }
  },

  /**
   * Fetches the details of a specific transaction.
   */
  getTransactionDetails: async (transactionId: string): Promise<Transaction> => {
    try {
      return await apiClient.get(`${API_ENDPOINTS.TRANSACTIONS}/${transactionId}`);
    } catch (error) {
      console.error(`Error fetching transaction details for ID ${transactionId}:`, error);
      throw error;
    }
  },

  /**
   * Creates a new fund transfer to another user.
   */
  createTransfer: async (transferData: TransferData): Promise<Transaction> => {
    try {
      return await apiClient.post(`${API_ENDPOINTS.TRANSACTIONS}/transfer`, transferData);
    } catch (error) {
      console.error("Error creating transfer:", error);
      throw error;
    }
  },

  /**
   * Fetches transaction statistics.
   */
  getTransactionStats: async (): Promise<any> => {
    try {
      return await apiClient.get(`${API_ENDPOINTS.TRANSACTIONS}/statistique/stats`);
    } catch (error) {
      console.error("Error fetching transaction stats:", error);
      throw error;
    }
  },
};
