import apiClient from "./apiClient"
import { API_ENDPOINTS } from "@/configuration/api"
import type { User } from "@/types"

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
  country: string
}

export const AuthService = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.LOGIN, { email, password })
      return response.data
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  },

  register: async (userData: RegisterData): Promise<{ token: string; user: User }> => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.REGISTER, userData)
      return response.data
    } catch (error) {
      console.error("Registration error:", error)
      throw error
    }
  },

  logout: async (): Promise<void> => {
    try {
      // The request interceptor handles the token
      await apiClient.post(API_ENDPOINTS.LOGOUT)
    } catch (error) {
      // It's often safe to ignore logout errors (e.g., if token is already expired)
      console.error("Logout error:", error)
    }
  },

  fetchUserProfile: async (): Promise<User> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PROFILE)
      return response.data
    } catch (error) {
      console.error("Fetch user profile error:", error)
      throw error
    }
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    try {
      const response = await apiClient.put(API_ENDPOINTS.PROFILE, data)
      return response.data
    } catch (error) {
      console.error("Update profile error:", error)
      throw error
    }
  },

  uploadAvatar: async (imageUri: string): Promise<{ avatarUrl: string }> => {
    const formData = new FormData()
    formData.append("avatar", {
      uri: imageUri,
      type: "image/jpeg",
      name: "avatar.jpg",
    } as any)

    try {
      const response = await apiClient.post("/users/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      return response.data
    } catch (error) {
      console.error("Upload avatar error:", error)
      throw error
    }
  },
}
