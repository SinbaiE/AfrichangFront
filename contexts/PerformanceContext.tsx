"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import * as SecureStore from "expo-secure-store"
import { useAuth } from "./AuthContext"

interface PerformanceMetric {
  id: string
  name: string
  value: number
  previousValue: number
  change: number
  changePercent: number
  trend: "up" | "down" | "stable"
  category: "financial" | "usage" | "efficiency" | "growth"
  unit: string
  description: string
  target?: number
  benchmark?: number
}

interface TimeSeriesData {
  timestamp: number
  value: number
  label?: string
}

interface PerformanceReport {
  period: "daily" | "weekly" | "monthly" | "yearly"
  metrics: PerformanceMetric[]
  charts: {
    portfolio: TimeSeriesData[]
    transactions: TimeSeriesData[]
    savings: TimeSeriesData[]
    efficiency: TimeSeriesData[]
  }
  insights: string[]
  recommendations: string[]
  score: number
}

interface PerformanceContextType {
  currentReport: PerformanceReport | null
  historicalReports: PerformanceReport[]
  isLoading: boolean
  selectedPeriod: "daily" | "weekly" | "monthly" | "yearly"
  generateReport: (period: "daily" | "weekly" | "monthly" | "yearly") => Promise<void>
  getMetricHistory: (metricId: string, days: number) => TimeSeriesData[]
  compareWithBenchmark: (metricId: string) => number
  exportReport: () => Promise<string>
  setSelectedPeriod: (period: "daily" | "weekly" | "monthly" | "yearly") => void
}

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined)

export function PerformanceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [currentReport, setCurrentReport] = useState<PerformanceReport | null>(null)
  const [historicalReports, setHistoricalReports] = useState<PerformanceReport[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly")

  useEffect(() => {
    if (user) {
      loadHistoricalReports()
      generateReport(selectedPeriod)
    }
  }, [user, selectedPeriod])

  const loadHistoricalReports = async () => {
    try {
      const stored = await SecureStore.getItemAsync("performance_reports")
      if (stored) {
        setHistoricalReports(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Erreur chargement rapports:", error)
    }
  }

  const saveReports = async (reports: PerformanceReport[]) => {
    try {
      await SecureStore.setItemAsync("performance_reports", JSON.stringify(reports))
    } catch (error) {
      console.error("Erreur sauvegarde rapports:", error)
    }
  }

  const generateReport = async (period: "daily" | "weekly" | "monthly" | "yearly") => {
    setIsLoading(true)
    try {
      // Simuler la génération de métriques de performance
      const metrics = await generatePerformanceMetrics(period)
      const charts = await generateChartData(period)
      const insights = generateInsights(metrics)
      const recommendations = generateRecommendations(metrics)
      const score = calculatePerformanceScore(metrics)

      const report: PerformanceReport = {
        period,
        metrics,
        charts,
        insights,
        recommendations,
        score,
      }

      setCurrentReport(report)

      // Sauvegarder dans l'historique
      const newReports = [report, ...historicalReports.slice(0, 11)] // Garder 12 rapports max
      setHistoricalReports(newReports)
      await saveReports(newReports)
    } catch (error) {
      console.error("Erreur génération rapport:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const generatePerformanceMetrics = async (period: string): Promise<PerformanceMetric[]> => {
    // Simuler des métriques réalistes
    const baseMetrics = [
      {
        id: "portfolio_value",
        name: "Valeur du portefeuille",
        category: "financial" as const,
        unit: "FCFA",
        description: "Valeur totale de vos avoirs",
        target: 1000000,
        benchmark: 800000,
      },
      {
        id: "monthly_savings",
        name: "Épargne mensuelle",
        category: "financial" as const,
        unit: "FCFA",
        description: "Montant épargné ce mois",
        target: 50000,
        benchmark: 30000,
      },
      {
        id: "transaction_volume",
        name: "Volume de transactions",
        category: "usage" as const,
        unit: "FCFA",
        description: "Volume total échangé",
        benchmark: 200000,
      },
      {
        id: "exchange_efficiency",
        name: "Efficacité des échanges",
        category: "efficiency" as const,
        unit: "%",
        description: "Pourcentage d'économies sur les frais",
        target: 95,
        benchmark: 85,
      },
      {
        id: "diversification_score",
        name: "Score de diversification",
        category: "financial" as const,
        unit: "/10",
        description: "Diversification de votre portefeuille",
        target: 8,
        benchmark: 6,
      },
      {
        id: "active_days",
        name: "Jours d'activité",
        category: "usage" as const,
        unit: "jours",
        description: "Nombre de jours actifs",
        target: 20,
        benchmark: 15,
      },
      {
        id: "roi_percentage",
        name: "Retour sur investissement",
        category: "financial" as const,
        unit: "%",
        description: "ROI sur vos échanges",
        target: 5,
        benchmark: 3,
      },
      {
        id: "user_growth",
        name: "Croissance d'utilisation",
        category: "growth" as const,
        unit: "%",
        description: "Augmentation de votre activité",
        benchmark: 10,
      },
    ]

    return baseMetrics.map((metric) => {
      const currentValue = generateRealisticValue(metric.id, period)
      const previousValue = currentValue * (0.9 + Math.random() * 0.2) // ±10% variation
      const change = currentValue - previousValue
      const changePercent = previousValue > 0 ? (change / previousValue) * 100 : 0

      return {
        ...metric,
        value: currentValue,
        previousValue,
        change,
        changePercent,
        trend: change > 0 ? "up" : change < 0 ? "down" : "stable",
      }
    })
  }

  const generateRealisticValue = (metricId: string, period: string): number => {
    const multiplier = period === "yearly" ? 12 : period === "monthly" ? 1 : period === "weekly" ? 0.25 : 0.033

    switch (metricId) {
      case "portfolio_value":
        return Math.round((500000 + Math.random() * 500000) * multiplier)
      case "monthly_savings":
        return Math.round((20000 + Math.random() * 40000) * multiplier)
      case "transaction_volume":
        return Math.round((100000 + Math.random() * 200000) * multiplier)
      case "exchange_efficiency":
        return Math.round(80 + Math.random() * 15)
      case "diversification_score":
        return Math.round((5 + Math.random() * 4) * 10) / 10
      case "active_days":
        return Math.round((10 + Math.random() * 15) * multiplier)
      case "roi_percentage":
        return Math.round((2 + Math.random() * 6) * 10) / 10
      case "user_growth":
        return Math.round((5 + Math.random() * 15) * 10) / 10
      default:
        return Math.round(Math.random() * 100)
    }
  }

  const generateChartData = async (period: string): Promise<PerformanceReport["charts"]> => {
    const dataPoints = period === "yearly" ? 12 : period === "monthly" ? 30 : period === "weekly" ? 7 : 24

    const generateTimeSeries = (baseValue: number, volatility: number): TimeSeriesData[] => {
      const data: TimeSeriesData[] = []
      let currentValue = baseValue

      for (let i = 0; i < dataPoints; i++) {
        const change = (Math.random() - 0.5) * volatility
        currentValue += change
        currentValue = Math.max(0, currentValue) // Éviter les valeurs négatives

        data.push({
          timestamp: Date.now() - (dataPoints - i) * 24 * 60 * 60 * 1000,
          value: Math.round(currentValue),
        })
      }

      return data
    }

    return {
      portfolio: generateTimeSeries(750000, 50000),
      transactions: generateTimeSeries(150000, 30000),
      savings: generateTimeSeries(35000, 10000),
      efficiency: generateTimeSeries(88, 5),
    }
  }

  const generateInsights = (metrics: PerformanceMetric[]): string[] => {
    const insights: string[] = []

    const portfolioMetric = metrics.find((m) => m.id === "portfolio_value")
    if (portfolioMetric && portfolioMetric.changePercent > 5) {
      insights.push(
        `Excellente performance ! Votre portefeuille a augmenté de ${portfolioMetric.changePercent.toFixed(1)}%`,
      )
    }

    const efficiencyMetric = metrics.find((m) => m.id === "exchange_efficiency")
    if (efficiencyMetric && efficiencyMetric.value > 90) {
      insights.push("Vous optimisez très bien vos frais d'échange")
    }

    const diversificationMetric = metrics.find((m) => m.id === "diversification_score")
    if (diversificationMetric && diversificationMetric.value < 5) {
      insights.push("Votre portefeuille pourrait bénéficier d'une meilleure diversification")
    }

    const savingsMetric = metrics.find((m) => m.id === "monthly_savings")
    if (savingsMetric && savingsMetric.target && savingsMetric.value > savingsMetric.target) {
      insights.push("Félicitations ! Vous avez dépassé votre objectif d'épargne")
    }

    return insights.length > 0 ? insights : ["Continuez vos efforts pour améliorer vos performances financières"]
  }

  const generateRecommendations = (metrics: PerformanceMetric[]): string[] => {
    const recommendations: string[] = []

    const diversificationMetric = metrics.find((m) => m.id === "diversification_score")
    if (diversificationMetric && diversificationMetric.value < 6) {
      recommendations.push("Diversifiez votre portefeuille en ajoutant d'autres devises")
    }

    const activityMetric = metrics.find((m) => m.id === "active_days")
    if (activityMetric && activityMetric.target && activityMetric.value < activityMetric.target * 0.7) {
      recommendations.push("Augmentez votre activité pour optimiser vos gains")
    }

    const efficiencyMetric = metrics.find((m) => m.id === "exchange_efficiency")
    if (efficiencyMetric && efficiencyMetric.value < 85) {
      recommendations.push("Utilisez les alertes de taux pour optimiser vos échanges")
    }

    return recommendations.length > 0
      ? recommendations
      : ["Maintenez vos bonnes habitudes financières", "Explorez de nouvelles opportunités d'investissement"]
  }

  const calculatePerformanceScore = (metrics: PerformanceMetric[]): number => {
    let totalScore = 0
    let validMetrics = 0

    metrics.forEach((metric) => {
      if (metric.target) {
        const score = Math.min(100, (metric.value / metric.target) * 100)
        totalScore += score
        validMetrics++
      } else if (metric.benchmark) {
        const score = Math.min(100, (metric.value / metric.benchmark) * 100)
        totalScore += score
        validMetrics++
      }
    })

    return validMetrics > 0 ? Math.round(totalScore / validMetrics) : 0
  }

  const getMetricHistory = (metricId: string, days: number): TimeSeriesData[] => {
    // Simuler l'historique d'une métrique
    const data: TimeSeriesData[] = []
    const baseValue = generateRealisticValue(metricId, "daily")

    for (let i = days; i >= 0; i--) {
      const variation = (Math.random() - 0.5) * 0.1 // ±5% variation
      const value = baseValue * (1 + variation)

      data.push({
        timestamp: Date.now() - i * 24 * 60 * 60 * 1000,
        value: Math.round(value),
      })
    }

    return data
  }

  const compareWithBenchmark = (metricId: string): number => {
    const metric = currentReport?.metrics.find((m) => m.id === metricId)
    if (!metric || !metric.benchmark) return 0

    return ((metric.value - metric.benchmark) / metric.benchmark) * 100
  }

  const exportReport = async (): Promise<string> => {
    if (!currentReport) throw new Error("Aucun rapport à exporter")

    const reportData = {
      report: currentReport,
      exportedAt: new Date().toISOString(),
      userId: user?.id,
    }

    return JSON.stringify(reportData, null, 2)
  }

  return (
    <PerformanceContext.Provider
      value={{
        currentReport,
        historicalReports,
        isLoading,
        selectedPeriod,
        generateReport,
        getMetricHistory,
        compareWithBenchmark,
        exportReport,
        setSelectedPeriod,
      }}
    >
      {children}
    </PerformanceContext.Provider>
  )
}

export const usePerformance = () => {
  const context = useContext(PerformanceContext)
  if (!context) {
    throw new Error("usePerformance must be used within PerformanceProvider")
  }
  return context
}
