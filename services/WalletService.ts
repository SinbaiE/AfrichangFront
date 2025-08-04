import apiClient from "./apiClient";
import { API_ENDPOINTS } from "@/configuration/api";
import type { Wallet, Currency } from "@/types";

/**
 * Service for wallet-related API calls.
 * All methods now use the fetch-based apiClient.
 */
export const WalletService = {
  /**
   * Fetches all wallets for the authenticated user.
   */
  getUserWallets: async (): Promise<{ wallets: Wallet[]; totalBalanceUSD: number }> => {
    try {
      return await apiClient.get(API_ENDPOINTS.WALLETS);
    } catch (error) {
      console.error("Error fetching user wallets:", error);
      throw error;
    }
  },

  /**
   * Fetches all supported currencies.
   */
  getCurrencies: async (): Promise<Currency[]> => {
    try {
      return await apiClient.get(API_ENDPOINTS.CURRENCIES);
    } catch (error) {
      console.error("Error fetching currencies:", error);
      throw error;
    }
  },

  /**
   * Creates a new wallet for a user.
   */
  createWallet: async (userId: string, currency: string): Promise<Wallet> => {
    try {
      return await apiClient.post(`${API_ENDPOINTS.WALLETS}/${userId}`, { currency });
    } catch (error) {
      console.error("Error creating wallet:", error);
      throw error;
    }
  },

  /**
   * Fetches a specific wallet by currency for a user.
   */
  getWalletByCurrency: async (userId: string, currency: string): Promise<Wallet> => {
    try {
      return await apiClient.get(`${API_ENDPOINTS.WALLETS}/${userId}/${currency}`);
    } catch (error) {
      console.error(`Error fetching wallet for currency ${currency}:`, error);
      throw error;
    }
  },

  /**
   * Fetches the balance for a specific wallet.
   */
  getWalletBalance: async (userId: string, currency: string): Promise<{ balance: number }> => {
    try {
      return await apiClient.get(`${API_ENDPOINTS.WALLETS}/${currency}/balance/${userId}`);
    } catch (error) {
      console.error(`Error fetching balance for wallet ${currency}:`, error);
      throw error;
    }
  },

  /**
   * Fetches statistics for a specific wallet.
   */
  getWalletStats: async (userId: string, currency: string): Promise<any> => {
    try {
      return await apiClient.get(`${API_ENDPOINTS.WALLETS}/stats/${userId}/${currency}`);
    } catch (error) {
      console.error(`Error fetching stats for wallet ${currency}:`, error);
      throw error;
    }
  },
};
