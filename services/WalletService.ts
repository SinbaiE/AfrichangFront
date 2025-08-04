import apiClient from "./apiClient"
import { API_ENDPOINTS } from "@/configuration/api"
import type { Wallet, Currency } from "@/types" // Assuming a Wallet type exists in types/index.ts

export const WalletService = {
  // Récupérer tous les portefeuilles de l'utilisateur
  getUserWallets: async (): Promise<{ wallets: Wallet[], totalBalanceUSD: number }> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WALLETS)
      // The API is expected to return { wallets: Wallet[], totalBalanceUSD: number }
      return response.data
    } catch (error) {
      console.error("Error fetching user wallets:", error)
      throw error
    }
  },

  // Get all supported currencies
  getCurrencies: async (): Promise<Currency[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CURRENCIES)
      return response.data
    } catch (error) {
      console.error("Error fetching currencies:", error)
      throw error
    }
  },

  // Créer un nouveau portefeuille pour un utilisateur
  createWallet: async (userId: string, currency: string): Promise<Wallet> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.WALLETS + `/${userId}`, { currency })
      return response.data
    } catch (error) {
      console.error("Error creating wallet:", error)
      throw error
    }
  },

  // Récupérer un portefeuille par devise
  getWalletByCurrency: async (userId: string, currency: string): Promise<Wallet> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WALLETS + `/${userId}/${currency}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching wallet for currency ${currency}:`, error)
      throw error
    }
  },

  // Obtenir le solde d'un portefeuille
  getWalletBalance: async (userId: string, currency: string): Promise<{ balance: number }> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WALLETS + `/${currency}/balance/${userId}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching balance for wallet ${currency}:`, error)
      throw error
    }
  },

  // Obtenir les statistiques d'un portefeuille
  getWalletStats: async (userId: string, currency: string): Promise<any> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.WALLETS + `/stats/${userId}/${currency}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching stats for wallet ${currency}:`, error)
      throw error
    }
  },
}
