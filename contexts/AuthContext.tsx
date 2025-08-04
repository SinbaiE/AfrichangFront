"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "@/types"
import * as SecureStore from "expo-secure-store"
import { AuthService } from "@/services/AuthService" // Import the service

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<User>
  uploadAvatar: (imageUri: string) => Promise<{ avatarUrl: string }>
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

  const checkAuthStatus = async () => {
    setIsLoading(true)
    try {
      const token = await SecureStore.getItemAsync("auth_token")
      if (token) {
        // Token exists, verify it by fetching profile
        const userData = await AuthService.fetchUserProfile()
        setUser(userData)
      }
    } catch (error) {
      // Token is invalid or fetch failed
      console.error("Auth check failed:", error)
      await SecureStore.deleteItemAsync("auth_token")
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { token, user } = await AuthService.login(email, password)
      await SecureStore.setItemAsync("auth_token", token)
      setUser(user)
    } catch (error) {
      // Re-throw the error to be caught by the UI component
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    setIsLoading(true)
    try {
      const { token, user } = await AuthService.register(userData)
      await SecureStore.setItemAsync("auth_token", token)
      setUser(user)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await AuthService.logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      await SecureStore.deleteItemAsync("auth_token")
      setUser(null)
    }
  }

  const updateProfile = async (data: Partial<User>): Promise<User> => {
    try {
      const updatedUser = await AuthService.updateProfile(data)
      setUser(updatedUser)
      return updatedUser
    } catch (error) {
      throw error
    }
  }

  const uploadAvatar = async (imageUri: string): Promise<{ avatarUrl: string }> => {
    try {
      // This service call now returns an object { avatarUrl: string }
      const result = await AuthService.uploadAvatar(imageUri)
      // Optionally update user profile if the new URL is not automatically reflected
      // For now, just return the result as the component might handle it.
      return result
    } catch (error) {
      throw error
    }
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
