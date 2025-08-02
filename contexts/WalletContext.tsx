"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Wallet, Currency } from "@/types"
import { useAuth } from "./AuthContext"
import * as SecureStore from "expo-secure-store"

interface WalletContextType {
  wallets: Wallet[]
  currencies: Currency[]
  isLoading: boolean
  totalBalanceUSD: number
  refreshWallets: () => Promise<void>
  createWallet: (currencyCode: string) => Promise<void>
  refreshBalances: () => Promise<void>
  getWalletByCurrency: (currencyCode: string) => Wallet | undefined
  getTotalBalance: () => number
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [totalBalanceUSD, setTotalBalanceUSD] = useState(0)

  useEffect(() => {
    if (isAuthenticated) {
      refreshWallets()
      loadCurrencies()
    }
  }, [isAuthenticated])

  const refreshWallets = async () => {
    setIsLoading(true)
    try {
      const token = await SecureStore.getItemAsync("auth_token")
      const response = await fetch("/api/wallets", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await response.json()
      setWallets(data.wallets)
      setTotalBalanceUSD(data.totalBalanceUSD)
    } catch (error) {
      console.error("Failed to load wallets:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadCurrencies = async () => {
    try {
      const response = await fetch("/api/currencies")
      const data = await response.json()
      setCurrencies(data)
    } catch (error) {
      console.error("Failed to load currencies:", error)
    }
  }

  const createWallet = async (currencyCode: string) => {
    try {
      const token = await SecureStore.getItemAsync("auth_token")
      const response = await fetch("/api/wallets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currencyCode }),
      })

      if (response.ok) {
        await refreshWallets()
      }
    } catch (error) {
      throw error
    }
  }

  const refreshBalances = async () => {
    await refreshWallets()
  }

  const getWalletByCurrency = (currencyCode: string) => {
    return wallets.find((wallet) => wallet.currency.code === currencyCode)
  }

  const getTotalBalance = () => {
    return wallets.reduce((sum, wallet) => sum + wallet.balance, 0)
  }

  return (
    <WalletContext.Provider
      value={{
        wallets,
        currencies,
        isLoading,
        totalBalanceUSD,
        refreshWallets,
        createWallet,
        refreshBalances,
        getWalletByCurrency,
        getTotalBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider")
  }
  return context
}
