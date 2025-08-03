import apiClient from "./apiClient"
import { API_ENDPOINTS } from "@/configuration/api"
import type { UserSettings } from "@/types" // Assuming a UserSettings type exists

export const ProfileService = {
  // Récupérer les paramètres de l'utilisateur
  getUserSettings: async (): Promise<UserSettings> => {
    const response = await apiClient.get(API_ENDPOINTS.USER_SETTINGS)
    return response.data
  },

  // Mettre à jour les paramètres de l'utilisateur
  updateUserSettings: async (settingsData: Partial<UserSettings>): Promise<UserSettings> => {
    const response = await apiClient.put(API_ENDPOINTS.USER_SETTINGS, settingsData)
    return response.data
  },

  // Récupérer les statistiques du profil
  getProfileStats: async (): Promise<any> => {
    const response = await apiClient.get(API_ENDPOINTS.PROFILE_STATS)
    return response.data
  },

  // Exporter les données de l'utilisateur
  exportUserData: async (): Promise<any> => {
    const response = await apiClient.post(API_ENDPOINTS.EXPORT_USER_DATA)
    return response.data // This might be a file or a link
  },

  // Supprimer le compte de l'utilisateur
  deleteUserAccount: async (): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.DELETE_USER_ACCOUNT)
  },
}
