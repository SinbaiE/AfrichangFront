"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { LineChart, BarChart, PieChart } from "react-native-chart-kit"
import { useAnalytics } from "@contexts/AnalyticsContext"

const { width } = Dimensions.get("window")

export default function AnalyticsScreen() {
  const { getUserMetrics, getEvents, exportData } = useAnalytics()
  const [metrics, setMetrics] = useState(getUserMetrics())
  const [events, setEvents] = useState(getEvents(50))
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month")

  useEffect(() => {
    setMetrics(getUserMetrics())
    setEvents(getEvents(50))
  }, [])

  const chartConfig = {
    backgroundColor: "#fff",
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(30, 41, 59, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: {
      r: "4",
      strokeWidth: "2",
      stroke: "#667eea",
    },
  }

  // Données pour les graphiques
  const getActivityData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toLocaleDateString("fr", { weekday: "short" })
    })

    const activityCounts = last7Days.map(() => Math.floor(Math.random() * 20) + 5)

    return {
      labels: last7Days,
      datasets: [{ data: activityCounts }],
    }
  }

  const getFeatureUsageData = () => {
    if (!metrics?.favoriteFeatures.length) {
      return {
        labels: ["Échange", "Portefeuille", "Profil"],
        datasets: [{ data: [30, 25, 15] }],
      }
    }

    return {
      labels: metrics.favoriteFeatures.slice(0, 3),
      datasets: [{ data: [40, 30, 20] }],
    }
  }

  const getTransactionVolumeData = () => {
    const pieData = [
      { name: "XOF", population: 45, color: "#667eea", legendFontColor: "#1e293b" },
      { name: "NGN", population: 30, color: "#10b981", legendFontColor: "#1e293b" },
      { name: "GHS", population: 15, color: "#f59e0b", legendFontColor: "#1e293b" },
      { name: "Autres", population: 10, color: "#ef4444", legendFontColor: "#1e293b" },
    ]

    return pieData
  }

  const handleExportData = async () => {
    try {
      const data = await exportData()
      console.log("Données exportées:", data.length, "caractères")
      // Ici vous pourriez partager le fichier ou l'envoyer par email
    } catch (error) {
      console.error("Erreur export:", error)
    }
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    if (hours > 0) return `${hours}h ${minutes % 60}min`
    return `${minutes}min`
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Analytics</Text>
            <Text style={styles.headerSubtitle}>Analysez votre utilisation</Text>
          </View>
          <TouchableOpacity style={styles.exportButton} onPress={handleExportData}>
            <Ionicons name="download-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {["week", "month", "year"].map((period) => (
            <TouchableOpacity
              key={period}
              style={[styles.periodButton, selectedPeriod === period && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod(period as any)}
            >
              <Text style={[styles.periodText, selectedPeriod === period && styles.periodTextActive]}>
                {period === "week" ? "Semaine" : period === "month" ? "Mois" : "Année"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Metrics Overview */}
        <View style={styles.metricsContainer}>
          <View style={styles.metricCard}>
            <Ionicons name="time-outline" size={24} color="#667eea" />
            <Text style={styles.metricNumber}>{metrics?.totalSessions || 0}</Text>
            <Text style={styles.metricLabel}>Sessions</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="pulse-outline" size={24} color="#10b981" />
            <Text style={styles.metricNumber}>{metrics?.totalEvents || 0}</Text>
            <Text style={styles.metricLabel}>Actions</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="trending-up-outline" size={24} color="#f59e0b" />
            <Text style={styles.metricNumber}>
              {metrics?.totalTransactionValue ? `${(metrics.totalTransactionValue / 1000).toFixed(0)}K` : "0"}
            </Text>
            <Text style={styles.metricLabel}>Volume FCFA</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="timer-outline" size={24} color="#ef4444" />
            <Text style={styles.metricNumber}>
              {metrics?.averageSessionDuration ? formatDuration(metrics.averageSessionDuration) : "0min"}
            </Text>
            <Text style={styles.metricLabel}>Durée moy.</Text>
          </View>
        </View>

        {/* Activity Chart */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Activité des 7 derniers jours</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={getActivityData()}
              width={width - 40}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        </View>

        {/* Feature Usage */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Fonctionnalités les plus utilisées</Text>
          <View style={styles.chartContainer}>
            <BarChart
              data={getFeatureUsageData()}
              width={width - 40}
              height={200}
              chartConfig={chartConfig}
              style={styles.chart}
            />
          </View>
        </View>

        {/* Transaction Volume by Currency */}
        <View style={styles.chartSection}>
          <Text style={styles.chartTitle}>Répartition par devise</Text>
          <View style={styles.chartContainer}>
            <PieChart
              data={getTransactionVolumeData()}
              width={width - 40}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              style={styles.chart}
            />
          </View>
        </View>

        {/* Recent Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activité récente</Text>
          {events.slice(0, 10).map((event) => (
            <View key={event.id} style={styles.eventCard}>
              <View style={styles.eventIcon}>
                <Ionicons name="pulse-outline" size={16} color="#667eea" />
              </View>
              <View style={styles.eventContent}>
                <Text style={styles.eventName}>{event.event.replace("_", " ")}</Text>
                <Text style={styles.eventTime}>{new Date(event.timestamp).toLocaleString()}</Text>
              </View>
              {event.properties.screen && <Text style={styles.eventScreen}>{event.properties.screen}</Text>}
            </View>
          ))}
        </View>

        {/* Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights</Text>
          <View style={styles.insightCard}>
            <Ionicons name="bulb-outline" size={24} color="#f59e0b" />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Fonctionnalité favorite</Text>
              <Text style={styles.insightText}>
                Vous utilisez principalement l'échange de devises. Avez-vous exploré nos autres fonctionnalités ?
              </Text>
            </View>
          </View>

          <View style={styles.insightCard}>
            <Ionicons name="time-outline" size={24} color="#10b981" />
            <View style={styles.insightContent}>
              <Text style={styles.insightTitle}>Moment d'activité</Text>
              <Text style={styles.insightText}>
                Vous êtes plus actif en fin de journée. Pensez à activer les notifications pour les meilleures offres.
              </Text>
            </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
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
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 10,
  },
  periodButton: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e1e5e9",
  },
  periodButtonActive: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  periodText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  periodTextActive: {
    color: "#fff",
  },
  metricsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 15,
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    width: (width - 55) / 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginVertical: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
  chartSection: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 15,
  },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chart: {
    borderRadius: 15,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 15,
  },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  eventIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  eventContent: {
    flex: 1,
  },
  eventName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 5,
    textTransform: "capitalize",
  },
  eventTime: {
    fontSize: 12,
    color: "#64748b",
  },
  eventScreen: {
    fontSize: 12,
    color: "#667eea",
    fontWeight: "500",
  },
  insightCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insightContent: {
    flex: 1,
    marginLeft: 15,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
})
