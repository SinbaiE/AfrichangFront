import apiClient from "./apiClient"
import { API_ENDPOINTS } from "@/configuration/api"
import type { Withdrawal } from "@/types" // Assuming a Withdrawal type exists

export const WithdrawalService = {
  // Créer une demande de retrait
  createWithdrawal: async (withdrawalData: any): Promise<Withdrawal> => {
    const response = await apiClient.post(API_ENDPOINTS.WITHDRAWALS, withdrawalData)
    return response.data
  },

  // Lister les retraits d'un utilisateur
  getWithdrawalsByUser: async (userId: string): Promise<Withdrawal[]> => {
    const response = await apiClient.get(API_ENDPOINTS.WITHDRAWALS_BY_USER(userId))
    return response.data
  },

  // Mettre à jour le statut d'un retrait (pour admin)
  updateWithdrawalStatus: async (withdrawalId: string, status: string): Promise<Withdrawal> => {
    const response = await apiClient.put(API_ENDPOINTS.UPDATE_WITHDRAWAL_STATUS(withdrawalId), { status })
    return response.data
  },
}
