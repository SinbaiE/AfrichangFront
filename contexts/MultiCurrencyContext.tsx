"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import * as SecureStore from "expo-secure-store"
import { useAuth } from "./AuthContext"

interface Currency {
  code: string
  name: string
  symbol: string
  flag: string
  country: string
  region: "west_africa" | "east_africa" | "central_africa" | "north_africa" | "southern_africa"
  isActive: boolean
  decimals: number
  isPopular: boolean
  exchangeRate?: number
  trend?: "up" | "down" | "stable"
  volatility?: "low" | "medium" | "high"
}

interface CurrencyPair {
  from: string
  to: string
  rate: number
  spread: number
  volume24h: number
  change24h: number
  lastUpdated: string
}

interface MultiCurrencyContextType {
  currencies: Currency[]
  supportedPairs: CurrencyPair[]
  preferredCurrencies: string[]
  baseCurrency: string
  isLoading: boolean
  addPreferredCurrency: (currencyCode: string) => void
  removePreferredCurrency: (currencyCode: string) => void
  setBaseCurrency: (currencyCode: string) => void
  getCurrencyByCode: (code: string) => Currency | undefined
  getPairRate: (from: string, to: string) => CurrencyPair | undefined
  convertAmount: (amount: number, from: string, to: string) => number
  getRegionalCurrencies: (region: string) => Currency[]
  getPopularCurrencies: () => Currency[]
  refreshRates: () => Promise<void>
}

const MultiCurrencyContext = createContext<MultiCurrencyContextType | undefined>(undefined)

const AFRICAN_CURRENCIES: Currency[] = [
  // Afrique de l'Ouest
  {
    code: "XOF",
    name: "Franc CFA BCEAO",
    symbol: "FCFA",
    flag: "🇸🇳",
    country: "Zone UEMOA",
    region: "west_africa",
    isActive: true,
    decimals: 0,
    isPopular: true,
  },
  {
    code: "NGN",
    name: "Naira nigérian",
    symbol: "₦",
    flag: "🇳🇬",
    country: "Nigeria",
    region: "west_africa",
    isActive: true,
    decimals: 2,
    isPopular: true,
  },
  {
    code: "GHS",
    name: "Cedi ghanéen",
    symbol: "₵",
    flag: "🇬🇭",
    country: "Ghana",
    region: "west_africa",
    isActive: true,
    decimals: 2,
    isPopular: true,
  },
  {
    code: "SLL",
    name: "Leone",
    symbol: "Le",
    flag: "🇸🇱",
    country: "Sierra Leone",
    region: "west_africa",
    isActive: true,
    decimals: 2,
    isPopular: false,
  },
  {
    code: "LRD",
    name: "Dollar libérien",
    symbol: "L$",
    flag: "🇱🇷",
    country: "Liberia",
    region: "west_africa",
    isActive: true,
    decimals: 2,
    isPopular: false,
  },

  // Afrique Centrale
  {
    code: "XAF",
    name: "Franc CFA BEAC",
    symbol: "FCFA",
    flag: "🇨🇲",
    country: "Zone CEMAC",
    region: "central_africa",
    isActive: true,
    decimals: 0,
    isPopular: true,
  },
  {
    code: "CDF",
    name: "Franc congolais",
    symbol: "FC",
    flag: "🇨🇩",
    country: "RD Congo",
    region: "central_africa",
    isActive: true,
    decimals: 2,
    isPopular: false,
  },

  // Afrique de l'Est
  {
    code: "KES",
    name: "Shilling kenyan",
    symbol: "KSh",
    flag: "🇰🇪",
    country: "Kenya",
    region: "east_africa",
    isActive: true,
    decimals: 2,
    isPopular: true,
  },
  {
    code: "UGX",
    name: "Shilling ougandais",
    symbol: "USh",
    flag: "🇺🇬",
    country: "Ouganda",
    region: "east_africa",
    isActive: true,
    decimals: 0,
    isPopular: true,
  },
  {
    code: "TZS",
    name: "Shilling tanzanien",
    symbol: "TSh",
    flag: "🇹🇿",
    country: "Tanzanie",
    region: "east_africa",
    isActive: true,
    decimals: 2,
    isPopular: true,
  },
  {
    code: "RWF",
    name: "Franc rwandais",
    symbol: "RF",
    flag: "🇷🇼",
    country: "Rwanda",
    region: "east_africa",
    isActive: true,
    decimals: 0,
    isPopular: false,
  },
  {
    code: "ETB",
    name: "Birr éthiopien",
    symbol: "Br",
    flag: "🇪🇹",
    country: "Éthiopie",
    region: "east_africa",
    isActive: true,
    decimals: 2,
    isPopular: false,
  },

  // Afrique du Nord
  {
    code: "EGP",
    name: "Livre égyptienne",
    symbol: "£E",
    flag: "🇪🇬",
    country: "Égypte",
    region: "north_africa",
    isActive: true,
    decimals: 2,
    isPopular: true,
  },
  {
    code: "MAD",
    name: "Dirham marocain",
    symbol: "DH",
    flag: "🇲🇦",
    country: "Maroc",
    region: "north_africa",
    isActive: true,
    decimals: 2,
    isPopular: true,
  },
  {
    code: "TND",
    name: "Dinar tunisien",
    symbol: "DT",
    flag: "🇹🇳",
    country: "Tunisie",
    region: "north_africa",
    isActive: true,
    decimals: 3,
    isPopular: false,
  },
  {
    code: "DZD",
    name: "Dinar algérien",
    symbol: "DA",
    flag: "🇩🇿",
    country: "Algérie",
    region: "north_africa",
    isActive: true,
    decimals: 2,
    isPopular: false,
  },

  // Afrique Australe
  {
    code: "ZAR",
    name: "Rand sud-africain",
    symbol: "R",
    flag: "🇿🇦",
    country: "Afrique du Sud",
    region: "southern_africa",
    isActive: true,
    decimals: 2,
    isPopular: true,
  },
  {
    code: "BWP",
    name: "Pula",
    symbol: "P",
    flag: "🇧🇼",
    country: "Botswana",
    region: "southern_africa",
    isActive: true,
    decimals: 2,
    isPopular: false,
  },
  {
    code: "NAD",
    name: "Dollar namibien",
    symbol: "N$",
    flag: "🇳🇦",
    country: "Namibie",
    region: "southern_africa",
    isActive: true,
    decimals: 2,
    isPopular: false,
  },

  // Devises de référence
  {
    code: "USD",
    name: "Dollar américain",
    symbol: "$",
    flag: "🇺🇸",
    country: "États-Unis",
    region: "north_africa", // Pour le classement
    isActive: true,
    decimals: 2,
    isPopular: true,
  },
  {
    code: "EUR",
    name: "Euro",
    symbol: "€",
    flag: "🇪🇺",
    country: "Zone Euro",
    region: "north_africa", // Pour le classement
    isActive: true,
    decimals: 2,
    isPopular: true,
  },
]

export function MultiCurrencyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [currencies, setCurrencies] = useState<Currency[]>(AFRICAN_CURRENCIES)
  const [supportedPairs, setSupportedPairs] = useState<CurrencyPair[]>([])
  const [preferredCurrencies, setPreferredCurrencies] = useState<string[]>(["XOF", "NGN", "USD", "EUR"])
  const [baseCurrency, setBaseCurrencyState] = useState<string>("XOF")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadUserPreferences()
    loadExchangeRates()
  }, [])

  const loadUserPreferences = async () => {
    try {
      const stored = await SecureStore.getItemAsync("currency_preferences")
      if (stored) {
        const prefs = JSON.parse(stored)
        setPreferredCurrencies(prefs.preferred || ["XOF", "NGN", "USD", "EUR"])
        setBaseCurrencyState(prefs.base || "XOF")
      }
    } catch (error) {
      console.error("Erreur chargement préférences devises:", error)
    }
  }

  const saveUserPreferences = async () => {
    try {
      await SecureStore.setItemAsync(
        "currency_preferences",
        JSON.stringify({
          preferred: preferredCurrencies,
          base: baseCurrency,
        }),
      )
    } catch (error) {
      console.error("Erreur sauvegarde préférences devises:", error)
    }
  }

  const loadExchangeRates = async () => {
    setIsLoading(true)
    try {
      // Simuler le chargement des taux de change
      const pairs: CurrencyPair[] = []

      for (const fromCurrency of currencies) {
        for (const toCurrency of currencies) {
          if (fromCurrency.code !== toCurrency.code) {
            // Simulation de taux avec variation réaliste
            const baseRate = generateRealisticRate(fromCurrency.code, toCurrency.code)
            const spread = calculateSpread(fromCurrency.code, toCurrency.code)

            pairs.push({
              from: fromCurrency.code,
              to: toCurrency.code,
              rate: baseRate,
              spread: spread,
              volume24h: Math.random() * 1000000,
              change24h: (Math.random() - 0.5) * 10, // ±5%
              lastUpdated: new Date().toISOString(),
            })
          }
        }
      }

      setSupportedPairs(pairs)

      // Mettre à jour les tendances des devises
      updateCurrencyTrends(pairs)
    } catch (error) {
      console.error("Erreur chargement taux:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateRealisticRate = (from: string, to: string): number => {
    // Taux de base réalistes (approximatifs)
    const baseRates: Record<string, number> = {
      USD: 1,
      EUR: 0.85,
      XOF: 580,
      XAF: 580,
      NGN: 750,
      GHS: 12,
      KES: 110,
      UGX: 3700,
      TZS: 2300,
      RWF: 1000,
      ETB: 55,
      EGP: 31,
      MAD: 10,
      TND: 3.1,
      DZD: 135,
      ZAR: 18,
      BWP: 13,
      NAD: 18,
      SLL: 20000,
      LRD: 190,
      CDF: 2000,
    }

    const fromRate = baseRates[from] || 1
    const toRate = baseRates[to] || 1

    return toRate / fromRate
  }

  const calculateSpread = (from: string, to: string): number => {
    // Spread variable selon la liquidité
    const lowLiquidityCurrencies = ["SLL", "LRD", "CDF", "RWF", "ETB", "TND", "BWP", "NAD"]
    const isLowLiquidity = lowLiquidityCurrencies.includes(from) || lowLiquidityCurrencies.includes(to)

    const baseSpread = 0.02 // 2%
    return isLowLiquidity ? baseSpread * 1.5 : baseSpread
  }

  const updateCurrencyTrends = (pairs: CurrencyPair[]) => {
    setCurrencies((prev) =>
      prev.map((currency) => {
        const usdPair = pairs.find((p) => p.from === currency.code && p.to === "USD")
        const change = usdPair?.change24h || 0

        return {
          ...currency,
          trend: change > 1 ? "up" : change < -1 ? "down" : "stable",
          volatility: Math.abs(change) > 3 ? "high" : Math.abs(change) > 1 ? "medium" : "low",
        }
      }),
    )
  }

  const addPreferredCurrency = (currencyCode: string) => {
    if (!preferredCurrencies.includes(currencyCode)) {
      const newPreferred = [...preferredCurrencies, currencyCode]
      setPreferredCurrencies(newPreferred)
      saveUserPreferences()
    }
  }

  const removePreferredCurrency = (currencyCode: string) => {
    const newPreferred = preferredCurrencies.filter((code) => code !== currencyCode)
    setPreferredCurrencies(newPreferred)
    saveUserPreferences()
  }

  const setBaseCurrency = (currencyCode: string) => {
    setBaseCurrencyState(currencyCode)
    saveUserPreferences()
  }

  const getCurrencyByCode = (code: string): Currency | undefined => {
    return currencies.find((currency) => currency.code === code)
  }

  const getPairRate = (from: string, to: string): CurrencyPair | undefined => {
    return supportedPairs.find((pair) => pair.from === from && pair.to === to)
  }

  const convertAmount = (amount: number, from: string, to: string): number => {
    if (from === to) return amount

    const pair = getPairRate(from, to)
    if (!pair) return 0

    return amount * pair.rate
  }

  const getRegionalCurrencies = (region: string): Currency[] => {
    return currencies.filter((currency) => currency.region === region && currency.isActive)
  }

  const getPopularCurrencies = (): Currency[] => {
    return currencies.filter((currency) => currency.isPopular && currency.isActive)
  }

  const refreshRates = async () => {
    await loadExchangeRates()
  }

  return (
    <MultiCurrencyContext.Provider
      value={{
        currencies,
        supportedPairs,
        preferredCurrencies,
        baseCurrency,
        isLoading,
        addPreferredCurrency,
        removePreferredCurrency,
        setBaseCurrency,
        getCurrencyByCode,
        getPairRate,
        convertAmount,
        getRegionalCurrencies,
        getPopularCurrencies,
        refreshRates,
      }}
    >
      {children}
    </MultiCurrencyContext.Provider>
  )
}

export const useMultiCurrency = () => {
  const context = useContext(MultiCurrencyContext)
  if (!context) {
    throw new Error("useMultiCurrency must be used within MultiCurrencyProvider")
  }
  return context
}
