"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Wallet, Currency } from "@/types"
import { useAuth } from "./AuthContext"
import { WalletService } from "@/services/WalletService"

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
    if (isAuthenticated && user) {
      refreshWallets()
      loadCurrencies()
    }
  }, [isAuthenticated, user])

  const refreshWallets = async () => {
    setIsLoading(true)
    try {
      // The service uses an interceptor for the token, so we don't need to pass it
      const { wallets, totalBalanceUSD } = await WalletService.getUserWallets()
      setWallets(wallets)
      setTotalBalanceUSD(totalBalanceUSD)
    } catch (error) {
      console.error("Failed to load wallets:", error)
      // Optionally, set an error state to show in the UI
    } finally {
      setIsLoading(false)
    }
  }

  const loadCurrencies = async () => {
    try {
      const data = await WalletService.getCurrencies()
      setCurrencies(data)
    } catch (error) {
      console.error("Failed to load currencies:", error)
    }
  }

  const createWallet = async (currencyCode: string) => {
    if (!user) {
      throw new Error("User must be authenticated to create a wallet.")
    }
    try {
      await WalletService.createWallet(user.id, currencyCode)
      // Refresh the wallet list to show the new wallet
      await refreshWallets()
    } catch (error) {
      // Re-throw to be handled by the calling component
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
