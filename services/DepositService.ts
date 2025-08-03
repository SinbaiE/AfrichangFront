import apiClient from "./apiClient"
import { API_ENDPOINTS } from "@/configuration/api"
import type { Deposit } from "@/types" // Assuming a Deposit type exists

export const DepositService = {
  // Récupérer les dépôts d'un utilisateur
  getUserDeposits: async (userId: string): Promise<Deposit[]> => {
    const response = await apiClient.get(API_ENDPOINTS.DEPOSITS + `/${userId}`)
    return response.data
  },

  // Créer un nouveau dépôt
  createDeposit: async (userId: string, depositData: any): Promise<Deposit> => {
    const response = await apiClient.post(API_ENDPOINTS.DEPOSITS + `/${userId}`, depositData)
    return response.data
  },

  // Récupérer les méthodes de paiement
  getPaymentMethods: async (): Promise<any[]> => {
    const response = await apiClient.get(API_ENDPOINTS.DEPOSITS + "/payment-methods")
    return response.data
  },

  // Récupérer un dépôt spécifique
  getDepositDetails: async (depositId: string): Promise<Deposit> => {
    const response = await apiClient.get(`${API_ENDPOINTS.DEPOSITS}/${depositId}/users`)
    return response.data
  },

  // Annuler un dépôt
  cancelDeposit: async (depositId: string): Promise<void> => {
    await apiClient.put(`${API_ENDPOINTS.DEPOSITS}/${depositId}/cancel`)
  },
}
