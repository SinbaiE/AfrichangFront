import apiClient from "./apiClient"
import { API_ENDPOINTS } from "@/configuration/api"
import type { Transaction } from "@/types" // Assuming a Transaction type exists

interface TransferData {
  receiverEmail: string
  amount: number
  currency: string
  description?: string
}

export const TransactionService = {
  // Récupérer la liste des transactions de l'utilisateur
  getUserTransactions: async (): Promise<Transaction[]> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.TRANSACTIONS)
      return response.data
    } catch (error) {
      console.error("Error fetching user transactions:", error)
      throw error
    }
  },

  // Récupérer les détails d'une transaction spécifique
  getTransactionDetails: async (transactionId: string): Promise<Transaction> => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.TRANSACTIONS}/${transactionId}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching transaction details for ID ${transactionId}:`, error)
      throw error
    }
  },

  // Créer un transfert de fonds
  createTransfer: async (transferData: TransferData): Promise<Transaction> => {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.TRANSACTIONS}/transfer`, transferData)
      return response.data
    } catch (error) {
      console.error("Error creating transfer:", error)
      throw error
    }
  },

  // Obtenir les statistiques des transactions
  getTransactionStats: async (): Promise<any> => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.TRANSACTIONS}/statistique/stats`)
      return response.data
    } catch (error) {
      console.error("Error fetching transaction stats:", error)
      throw error
    }
  },
}
