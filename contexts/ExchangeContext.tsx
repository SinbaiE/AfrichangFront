"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { ExchangeRate, Transaction } from "@/types"
import { ExchangeService } from "@/services/ExchangeService"

interface ExchangeContextType {
  rates: ExchangeRate[]
  isLoading: boolean
  getRate: (from: string, to: string) => ExchangeRate | undefined
  calculateExchange: (amount: number, from: string, to: string) => ExchangeCalculation
  executeExchange: (params: ExchangeParams) => Promise<Transaction>
  refreshRates: () => Promise<void>
}

interface ExchangeCalculation {
  fromAmount: number
  toAmount: number
  rate: number
  fee: number
  total: number
}

interface ExchangeParams {
  fromCurrency: string
  toCurrency: string
  amount: number
}

const ExchangeContext = createContext<ExchangeContextType | undefined>(undefined)

export function ExchangeProvider({ children }: { children: ReactNode }) {
  const [rates, setRates] = useState<ExchangeRate[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // useEffect(() => {
  //   loadRates()
  //   // Actualiser les taux toutes les 30 secondes
  //   const interval = setInterval(loadRates, 30000)
  //   return () => clearInterval(interval)
  // }, [])

  const loadRates = async () => {
    setIsLoading(true)
    try {
      const data = await ExchangeService.getInternalRates()
      setRates(data)
    } catch (error) {
      console.error("Failed to load exchange rates:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRate = (from: string, to: string) => {
    return rates.find((rate) => rate.from === from && rate.to === to)
  }

  const calculateExchange = (amount: number, from: string, to: string): ExchangeCalculation => {
    const rate = getRate(from, to)
    if (!rate) {
      throw new Error(`Exchange rate not found for ${from} to ${to}`)
    }

    const toAmount = amount * rate.rate
    const fee = amount * 0.01 // 1% de frais
    const total = toAmount - fee

    return {
      fromAmount: amount,
      toAmount: total,
      rate: rate.rate,
      fee,
      total,
    }
  }

  const executeExchange = async (params: ExchangeParams): Promise<Transaction> => {
    try {
      return await ExchangeService.executeExchange(params);
    } catch (error) {
      throw error
    }
  }

  const refreshRates = async () => {
    await loadRates()
  }

  return (
    <ExchangeContext.Provider
      value={{
        rates,
        isLoading,
        getRate,
        calculateExchange,
        executeExchange,
        refreshRates,
      }}
    >
      {children}
    </ExchangeContext.Provider>
  )
}

export const useExchange = () => {
  const context = useContext(ExchangeContext)
  if (!context) {
    throw new Error("useExchange must be used within ExchangeProvider")
  }
  return context
}
