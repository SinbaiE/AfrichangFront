"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react"
import * as SecureStore from "expo-secure-store"
import { AuthService } from "@/services/AuthService"
import type { User } from "@/types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  requires2FA: boolean;
  tempToken: string | null;
  login: (email: string, password: string) => Promise<{ requires2FA: boolean }>;
  verifyAndLogin: (code: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<User>
  uploadAvatar: (imageUri: string) => Promise<{ avatarUrl: string }>
}

interface RegisterData {
  email: string
  password: string
  FirstName: string
  LastName: string
  phone: string
  country: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [requires2FA, setRequires2FA] = useState<boolean>(false);
  const [tempToken, setTempToken] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    setIsLoading(true)
    try {
      const token = await SecureStore.getItemAsync("auth_token")
      if (token) {
        const userData = await AuthService.fetchUserProfile()
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      await SecureStore.deleteItemAsync("auth_token")
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await AuthService.login(email, password);
      if (response.requiresTwoFactor) {
        setTempToken(response.tempToken);
        setRequires2FA(true);
        return { requires2FA: true };
      } else {
        setUser(response.user);
        // The token is already stored by AuthService, no need to do it here
        return { requires2FA: false };
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndLogin = async (code: string) => {
    if (!tempToken) {
      throw new Error("Temporary token not available for 2FA verification.");
    }
    setIsLoading(true);
    try {
      const { user } = await AuthService.verify2FA(tempToken, code);
      setUser(user);
      // Reset 2FA state
      setRequires2FA(false);
      setTempToken(null);
    } catch (error) {
      console.error("2FA verification failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true)
    try {
      const { token, user } = await AuthService.register(userData)
      await SecureStore.setItemAsync("auth_token", token)
      setUser(user)
    } catch (error) {
      console.error("Register failed:", error)
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
      setRequires2FA(false);
      setTempToken(null);
    }
  }

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await AuthService.updateProfile(data)
      setUser(updatedUser)
      return updatedUser
    } catch (error) {
      console.error("Profile update failed:", error)
      throw error
    }
  }

  const uploadAvatar = async (imageUri: string) => {
    try {
      const result = await AuthService.uploadAvatar(imageUri)
      return result
    } catch (error) {
      console.error("Upload avatar failed:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        requires2FA,
        tempToken,
        login,
        verifyAndLogin,
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
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
