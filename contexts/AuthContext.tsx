"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "@/types"
import * as SecureStore from "expo-secure-store"
import { API_BASE_URL } from "@/configuration/api"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  uploadAvatar: (imageUri: string) => Promise<string>
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
  country: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // useEffect(() => {
  //   checkAuthStatus()
  // }, [])

  // const checkAuthStatus = async () => {
  //   try {
  //     const token = await SecureStore.getItemAsync("auth_token")
  //     if (token) {
  //       const userData = await fetchUserProfile(token)
  //       setUser(userData)
  //     }
  //   } catch (error) {
  //     console.error("Auth check failed:", error)
  //     await SecureStore.deleteItemAsync("auth_token")
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erreur de connexion")
      }

      await SecureStore.setItemAsync("auth_token", data.token)
      setUser(data.user)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Erreur d'inscription")
      }

      await SecureStore.setItemAsync("auth_token", data.token)
      setUser(data.user)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      const token = await SecureStore.getItemAsync("auth_token")
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        })
      }
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      // await SecureStore.deleteItemAsync("auth_token")
      setUser(null)
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      const token = await SecureStore.getItemAsync("auth_token")
      const response = await fetch(`${API_BASE_URL}/user/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Erreur de mise à jour du profil")
      }

      const updatedUser = await response.json()
      setUser(updatedUser)
      return updatedUser
    } catch (error) {
      throw error
    }
  }

  const uploadAvatar = async (imageUri: string): Promise<string> => {
    try {
      const token = await SecureStore.getItemAsync("auth_token")

      const formData = new FormData()
      formData.append("avatar", {
        uri: imageUri,
        type: "image/jpeg",
        name: "avatar.jpg",
      } as any)

      const response = await fetch(`${API_BASE_URL}/user/avatar`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Erreur d'upload de l'avatar")
      }

      const data = await response.json()
      return data.avatarUrl
    } catch (error) {
      throw error
    }
  }

  const fetchUserProfile = async (token: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/user/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!response.ok) {
      throw new Error("Token invalide")
    }

    return response.json()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        uploadAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
