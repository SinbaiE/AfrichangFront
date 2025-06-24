"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { LineChart, BarChart, PieChart } from "react-native-chart-kit"

const screenWidth = Dimensions.get("window").width

interface ReportData {
  transactionVolume: {
    labels: string[]
    datasets: [{ data: number[] }]
  }
  userGrowth: {
    labels: string[]
    datasets: [{ data: number[] }]
  }
  revenueByCountry: {
    name: string
    population: number
    color: string
    legendFontColor: string
    legendFontSize: number
  }[]
  kycStats: {
    approved: number
    pending: number
    rejected: number
  }
}

export default function ReportsManagement() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<"7d" | "30d" | "90d" | "1y">("30d")

  useEffect(() => {
    loadReportData()
  }, [selectedPeriod])

  const loadReportData = async () => {
    try {
      const response = await fetch(`/api/admin/reports?period=${selectedPeriod}`)
      const data = await response.json()
      setReportData(data)
    } catch (error) {
      console.error("Erreur chargement rapports:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#3b82f6",
    },
  }

  const exportReport = async (type: "pdf" | "excel") => {
    try {
      const response = await fetch(`/api/admin/reports/export?type=${type}&period=${selectedPeriod}`)
      const blob = await response.blob()
      // Handle file download
      console.log("Export réussi:", type)
    } catch (error) {
      console.error("Erreur export:", error)
    }
  }

  if (isLoading || !reportData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Chargement des rapports...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#1e293b", "#334155"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rapports</Text>
        <TouchableOpacity style={styles.exportButton} onPress={() => exportReport("pdf")}>
          <Ionicons name="download-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {[
          { key: "7d", label: "7 jours" },
          { key: "30d", label: "30 jours" },
          { key: "90d", label: "90 jours" },
          { key: "1y", label: "1 an" },
        ].map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[styles.periodButton, selectedPeriod === period.key && styles.periodButtonActive]}
            onPress={() => setSelectedPeriod(period.key as any)}
          >
            <Text style={[styles.periodText, selectedPeriod === period.key && styles.periodTextActive]}>
              {period.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.reportsContainer} showsVerticalScrollIndicator={false}>
        {/* Transaction Volume Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Volume des transactions</Text>
            <TouchableOpacity onPress={() => exportReport("excel")}>
              <Ionicons name="share-outline" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
          <LineChart
            data={reportData.transactionVolume}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        {/* User Growth Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Croissance des utilisateurs</Text>
            <TouchableOpacity>
              <Ionicons name="share-outline" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
          <BarChart
            data={reportData.userGrowth}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
            }}
            style={styles.chart}
          />
        </View>

        {/* Revenue by Country */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Revenus par pays</Text>
            <TouchableOpacity>
              <Ionicons name="share-outline" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
          <PieChart
            data={reportData.revenueByCountry}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        </View>

        {/* KYC Statistics */}
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Statistiques KYC</Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, styles.approvedCard]}>
              <Ionicons name="checkmark-circle" size={32} color="#10b981" />
              <Text style={styles.statNumber}>{reportData.kycStats.approved}</Text>
              <Text style={styles.statLabel}>Approuvés</Text>
            </View>
            <View style={[styles.statCard, styles.pendingCard]}>
              <Ionicons name="time" size={32} color="#f59e0b" />
              <Text style={styles.statNumber}>{reportData.kycStats.pending}</Text>
              <Text style={styles.statLabel}>En attente</Text>
            </View>
            <View style={[styles.statCard, styles.rejectedCard]}>
              <Ionicons name="close-circle" size={32} color="#ef4444" />
              <Text style={styles.statNumber}>{reportData.kycStats.rejected}</Text>
              <Text style={styles.statLabel}>Rejetés</Text>
            </View>
          </View>
        </View>

        {/* Export Options */}
        <View style={styles.exportContainer}>
          <Text style={styles.exportTitle}>Exporter les données</Text>
          <View style={styles.exportButtons}>
            <TouchableOpacity style={[styles.exportBtn, styles.pdfButton]} onPress={() => exportReport("pdf")}>
              <Ionicons name="document-text" size={20} color="#fff" />
              <Text style={styles.exportBtnText}>PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.exportBtn, styles.excelButton]} onPress={() => exportReport("excel")}>
              <Ionicons name="grid" size={20} color="#fff" />
              <Text style={styles.exportBtnText}>Excel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  exportButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  periodSelector: {
    flexDirection: "row",
    backgroundColor: "#fff",
    margin: 20,
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: "#3b82f6",
  },
  periodText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  periodTextActive: {
    color: "#fff",
  },
  reportsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  chart: {
    borderRadius: 16,
  },
  statsContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statCard: {
    alignItems: "center",
    padding: 15,
    borderRadius: 12,
    minWidth: 80,
  },
  approvedCard: {
    backgroundColor: "#f0fdf4",
  },
  pendingCard: {
    backgroundColor: "#fffbeb",
  },
  rejectedCard: {
    backgroundColor: "#fef2f2",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
  exportContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exportTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 15,
  },
  exportButtons: {
    flexDirection: "row",
    gap: 15,
  },
  exportBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  pdfButton: {
    backgroundColor: "#ef4444",
  },
  excelButton: {
    backgroundColor: "#10b981",
  },
  exportBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
})
