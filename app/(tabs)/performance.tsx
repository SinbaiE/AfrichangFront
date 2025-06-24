"use client"

import { useState } from "react"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { LineChart, BarChart, ProgressChart } from "react-native-chart-kit"
import { usePerformance } from "@contexts/PerformanceContext"

const { width } = Dimensions.get("window")

export default function PerformanceScreen() {
  const {
    currentReport,
    isLoading,
    selectedPeriod,
    generateReport,
    getMetricHistory,
    compareWithBenchmark,
    exportReport,
    setSelectedPeriod,
  } = usePerformance()

  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)

  const periods = [
    { key: "daily", name: "Jour", icon: "today-outline" },
    { key: "weekly", name: "Semaine", icon: "calendar-outline" },
    { key: "monthly", name: "Mois", icon: "calendar-outline" },
    { key: "yearly", name: "Année", icon: "calendar-outline" },
  ]

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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "#10b981"
    if (score >= 60) return "#f59e0b"
    return "#ef4444"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Bon"
    if (score >= 40) return "Moyen"
    return "À améliorer"
  }

  const formatValue = (value: number, unit: string) => {
    if (unit === "FCFA") {
      return `${(value / 1000).toFixed(0)}K FCFA`
    }
    if (unit === "%") {
      return `${value.toFixed(1)}%`
    }
    if (unit === "/10") {
      return `${value.toFixed(1)}/10`
    }
    return `${value} ${unit}`
  }

  const getChangeIcon = (change: number) => {
    if (change > 0) return "trending-up"
    if (change < 0) return "trending-down"
    return "remove"
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return "#10b981"
    if (change < 0) return "#ef4444"
    return "#64748b"
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "financial":
        return "wallet-outline"
      case "usage":
        return "pulse-outline"
      case "efficiency":
        return "speedometer-outline"
      case "growth":
        return "trending-up-outline"
      default:
        return "analytics-outline"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "financial":
        return "#10b981"
      case "usage":
        return "#667eea"
      case "efficiency":
        return "#f59e0b"
      case "growth":
        return "#ef4444"
      default:
        return "#64748b"
    }
  }

  const renderMetricCard = (metric: any) => {
    const benchmarkComparison = compareWithBenchmark(metric.id)

    return (
      <TouchableOpacity
        key={metric.id}
        style={styles.metricCard}
        onPress={() => setSelectedMetric(selectedMetric === metric.id ? null : metric.id)}
      >
        <View style={styles.metricHeader}>
          <View style={[styles.metricIcon, { backgroundColor: `${getCategoryColor(metric.category)}20` }]}>
            <Ionicons
              name={getCategoryIcon(metric.category) as any}
              size={20}
              color={getCategoryColor(metric.category)}
            />
          </View>
          <View style={styles.metricInfo}>
            <Text style={styles.metricName}>{metric.name}</Text>
            <Text style={styles.metricDescription}>{metric.description}</Text>
          </View>
          <View style={styles.metricTrend}>
            <Ionicons name={getChangeIcon(metric.change) as any} size={16} color={getChangeColor(metric.change)} />
          </View>
        </View>

        <View style={styles.metricValues}>
          <Text style={styles.metricValue}>{formatValue(metric.value, metric.unit)}</Text>
          <Text style={[styles.metricChange, { color: getChangeColor(metric.change) }]}>
            {metric.change > 0 ? "+" : ""}
            {metric.changePercent.toFixed(1)}%
          </Text>
        </View>

        {metric.target && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(100, (metric.value / metric.target) * 100)}%`,
                    backgroundColor: getCategoryColor(metric.category),
                  },
                ]}
              />
            </View>
            <Text style={styles.progressText}>{((metric.value / metric.target) * 100).toFixed(0)}% de l'objectif</Text>
          </View>
        )}

        {benchmarkComparison !== 0 && (
          <Text style={[styles.benchmarkText, { color: getChangeColor(benchmarkComparison) }]}>
            {benchmarkComparison > 0 ? "+" : ""}
            {benchmarkComparison.toFixed(1)}% vs benchmark
          </Text>
        )}

        {selectedMetric === metric.id && (
          <View style={styles.metricDetails}>
            <Text style={styles.detailsTitle}>Historique (30 jours)</Text>
            <View style={styles.miniChart}>
              <LineChart
                data={{
                  labels: ["", "", "", "", ""],
                  datasets: [
                    {
                      data: getMetricHistory(metric.id, 30)
                        .slice(-5)
                        .map((d) => d.value),
                    },
                  ],
                }}
                width={width - 80}
                height={120}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) =>
                    `${getCategoryColor(metric.category)}${Math.round(opacity * 255).toString(16)}`,
                }}
                bezier
                withDots={false}
                withInnerLines={false}
                withOuterLines={false}
                withVerticalLabels={false}
                withHorizontalLabels={false}
                style={{ borderRadius: 8 }}
              />
            </View>
          </View>
        )}
      </TouchableOpacity>
    )
  }

  const renderPerformanceChart = () => {
    if (!currentReport) return null

    const chartData = {
      labels: ["Portfolio", "Transactions", "Épargne", "Efficacité"],
      datasets: [
        {
          data: [
            currentReport.charts.portfolio[currentReport.charts.portfolio.length - 1]?.value || 0,
            currentReport.charts.transactions[currentReport.charts.transactions.length - 1]?.value || 0,
            currentReport.charts.savings[currentReport.charts.savings.length - 1]?.value || 0,
            currentReport.charts.efficiency[currentReport.charts.efficiency.length - 1]?.value || 0,
          ],
        },
      ],
    }

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Vue d'ensemble des performances</Text>
        <BarChart
          data={chartData}
          width={width - 40}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          showValuesOnTopOfBars
        />
      </View>
    )
  }

  const renderPortfolioChart = () => {
    if (!currentReport) return null

    const chartData = {
      labels: currentReport.charts.portfolio.slice(-7).map((_, index) => {
        const date = new Date()
        date.setDate(date.getDate() - (6 - index))
        return date.toLocaleDateString("fr", { weekday: "short" })
      }),
      datasets: [
        {
          data: currentReport.charts.portfolio.slice(-7).map((d) => d.value / 1000), // En milliers
        },
      ],
    }

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Évolution du portefeuille (7 jours)</Text>
        <LineChart
          data={chartData}
          width={width - 40}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </View>
    )
  }

  const renderScoreChart = () => {
    if (!currentReport) return null

    const scoreData = {
      labels: ["Score"],
      data: [currentReport.score / 100],
    }

    return (
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreTitle}>Score de performance</Text>
        <View style={styles.scoreChart}>
          <ProgressChart
            data={scoreData}
            width={200}
            height={200}
            strokeWidth={16}
            radius={80}
            chartConfig={{
              backgroundColor: "#fff",
              backgroundGradientFrom: "#fff",
              backgroundGradientTo: "#fff",
              color: (opacity = 1) => getScoreColor(currentReport.score),
            }}
            hideLegend
          />
          <View style={styles.scoreOverlay}>
            <Text style={[styles.scoreValue, { color: getScoreColor(currentReport.score) }]}>
              {currentReport.score}
            </Text>
            <Text style={styles.scoreLabel}>{getScoreLabel(currentReport.score)}</Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Performance</Text>
            <Text style={styles.headerSubtitle}>Analysez vos résultats financiers</Text>
          </View>
          <TouchableOpacity style={styles.exportButton} onPress={exportReport}>
            <Ionicons name="download-outline" size={20} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Period Selector */}
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <TouchableOpacity
              key={period.key}
              style={[styles.periodButton, selectedPeriod === period.key && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod(period.key as any)}
            >
              <Ionicons
                name={period.icon as any}
                size={16}
                color={selectedPeriod === period.key ? "#fff" : "#64748b"}
              />
              <Text style={[styles.periodText, selectedPeriod === period.key && styles.periodTextActive]}>
                {period.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Génération du rapport...</Text>
          </View>
        ) : currentReport ? (
          <>
            {/* Performance Score */}
            {renderScoreChart()}

            {/* Key Metrics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Métriques clés</Text>
              {currentReport.metrics.filter((m) => m.category === "financial").map(renderMetricCard)}
            </View>

            {/* Charts */}
            {renderPerformanceChart()}
            {renderPortfolioChart()}

            {/* Usage Metrics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Utilisation</Text>
              {currentReport.metrics.filter((m) => m.category === "usage").map(renderMetricCard)}
            </View>

            {/* Efficiency Metrics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Efficacité</Text>
              {currentReport.metrics.filter((m) => m.category === "efficiency").map(renderMetricCard)}
            </View>

            {/* Growth Metrics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Croissance</Text>
              {currentReport.metrics.filter((m) => m.category === "growth").map(renderMetricCard)}
            </View>

            {/* Insights */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Insights</Text>
              {currentReport.insights.map((insight, index) => (
                <View key={index} style={styles.insightCard}>
                  <Ionicons name="bulb-outline" size={20} color="#f59e0b" />
                  <Text style={styles.insightText}>{insight}</Text>
                </View>
              ))}
            </View>

            {/* Recommendations */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recommandations</Text>
              {currentReport.recommendations.map((recommendation, index) => (
                <View key={index} style={styles.recommendationCard}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#10b981" />
                  <Text style={styles.recommendationText}>{recommendation}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="analytics-outline" size={64} color="#94a3b8" />
            <Text style={styles.emptyTitle}>Aucun rapport disponible</Text>
            <Text style={styles.emptyText}>Générez votre premier rapport de performance</Text>
          </View>
        )}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e1e5e9",
    gap: 5,
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
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: "#64748b",
  },
  scoreContainer: {
    alignItems: "center",
    marginVertical: 30,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 20,
  },
  scoreChart: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 5,
  },
  scoreLabel: {
    fontSize: 14,
    color: "#64748b",
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
  metricCard: {
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
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  metricInfo: {
    flex: 1,
  },
  metricName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 5,
  },
  metricDescription: {
    fontSize: 12,
    color: "#64748b",
  },
  metricTrend: {
    alignItems: "center",
  },
  metricValues: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
  },
  metricChange: {
    fontSize: 14,
    fontWeight: "600",
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBar: {
    height: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 3,
    marginBottom: 5,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#64748b",
  },
  benchmarkText: {
    fontSize: 12,
    fontWeight: "600",
  },
  metricDetails: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 15,
    marginTop: 15,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 10,
  },
  miniChart: {
    alignItems: "center",
  },
  chartContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 15,
    textAlign: "center",
  },
  chart: {
    borderRadius: 16,
  },
  insightCard: {
    flexDirection: "row",
    alignItems: "flex-start",
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
  insightText: {
    fontSize: 14,
    color: "#1e293b",
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  recommendationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
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
  recommendationText: {
    fontSize: 14,
    color: "#1e293b",
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
})
