"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, RefreshControl } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"

interface AdminStats {
  totalUsers: number
  pendingKYC: number
  completedTransactions: number
  totalVolume: number
  activeUsers: number
  flaggedAccounts: number
}

interface KYCRequest {
  id: string
  userId: string
  userName: string
  email: string
  status: "pending" | "approved" | "rejected"
  submittedAt: string
  country: string
  documentType: string
  riskScore: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    pendingKYC: 0,
    completedTransactions: 0,
    totalVolume: 0,
    activeUsers: 0,
    flaggedAccounts: 0,
  })
  const [kycRequests, setKycRequests] = useState<KYCRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [statsResponse, kycResponse] = await Promise.all([
        fetch("/api/admin/stats"),
        fetch("/api/admin/kyc/pending"),
      ])

      const statsData = await statsResponse.json()
      const kycData = await kycResponse.json()

      setStats(statsData)
      setKycRequests(kycData.requests || [])
    } catch (error) {
      console.error("Erreur chargement données admin:", error)
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadDashboardData()
  }

  const handleKYCAction = async (requestId: string, action: "approve" | "reject", reason?: string) => {
    try {
      const response = await fetch(`/api/admin/kyc/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      })

      if (response.ok) {
        Alert.alert("Succès", `Demande KYC ${action === "approve" ? "approuvée" : "rejetée"}`)
        loadDashboardData()
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de traiter la demande")
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 80) return "#ef4444"
    if (score >= 50) return "#f59e0b"
    return "#4ade80"
  }

  const getRiskLabel = (score: number) => {
    if (score >= 80) return "Élevé"
    if (score >= 50) return "Moyen"
    return "Faible"
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <LinearGradient colors={["#1e293b", "#334155"]} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Dashboard Admin</Text>
            <Text style={styles.headerSubtitle}>Gestion AfriChange</Text>
          </View>
          <TouchableOpacity style={styles.settingsButton} onPress={()=>router.push('/(tabs)/settings')}>
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardPrimary]}>
              <Ionicons name="people-outline" size={24} color="#3b82f6" />
              <Text style={styles.statNumber}>{stats.totalUsers.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Utilisateurs</Text>
            </View>

            <View style={[styles.statCard, styles.statCardWarning]}>
              <Ionicons name="time-outline" size={24} color="#f59e0b" />
              <Text style={styles.statNumber}>{stats.pendingKYC}</Text>
              <Text style={styles.statLabel}>KYC en attente</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardSuccess]}>
              <Ionicons name="swap-horizontal-outline" size={24} color="#10b981" />
              <Text style={styles.statNumber}>{stats.completedTransactions.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Transactions</Text>
            </View>

            <View style={[styles.statCard, styles.statCardInfo]}>
              <Ionicons name="trending-up-outline" size={24} color="#8b5cf6" />
              <Text style={styles.statNumber}>{(stats.totalVolume / 1000000).toFixed(1)}M</Text>
              <Text style={styles.statLabel}>Volume FCFA</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, styles.statCardActive]}>
              <Ionicons name="pulse-outline" size={24} color="#06b6d4" />
              <Text style={styles.statNumber}>{stats.activeUsers}</Text>
              <Text style={styles.statLabel}>Actifs 24h</Text>
            </View>

            <View style={[styles.statCard, styles.statCardDanger]}>
              <Ionicons name="warning-outline" size={24} color="#ef4444" />
              <Text style={styles.statNumber}>{stats.flaggedAccounts}</Text>
              <Text style={styles.statLabel}>Comptes signalés</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions rapides</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/(admin)/kyc-management")}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#667eea" />
              <Text style={styles.actionText}>Gestion KYC</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/(admin)/transactions")}>
              <Ionicons name="receipt-outline" size={24} color="#667eea" />
              <Text style={styles.actionText}>Transactions</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/(admin)/utilisateurs")}>
              <Ionicons name="people-outline" size={24} color="#667eea" />
              <Text style={styles.actionText}>Utilisateurs</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={() => router.push("/(admin)/rapports")}>
              <Ionicons name="bar-chart-outline" size={24} color="#667eea" />
              <Text style={styles.actionText}>Rapports</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Pending KYC Requests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Demandes KYC en attente</Text>
            <TouchableOpacity onPress={() => router.push("/(admin)/kyc-management")}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {kycRequests.slice(0, 5).map((request) => (
            <View key={request.id} style={styles.kycCard}>
              <View style={styles.kycHeader}>
                <View style={styles.kycUserInfo}>
                  <Text style={styles.kycUserName}>{request.userName}</Text>
                  <Text style={styles.kycUserEmail}>{request.email}</Text>
                </View>
                <View style={[styles.riskBadge, { backgroundColor: getRiskColor(request.riskScore) }]}>
                  <Text style={styles.riskText}>{getRiskLabel(request.riskScore)}</Text>
                </View>
              </View>

              <View style={styles.kycDetails}>
                <View style={styles.kycDetailItem}>
                  <Ionicons name="location-outline" size={16} color="#64748b" />
                  <Text style={styles.kycDetailText}>{request.country}</Text>
                </View>
                <View style={styles.kycDetailItem}>
                  <Ionicons name="card-outline" size={16} color="#64748b" />
                  <Text style={styles.kycDetailText}>{request.documentType}</Text>
                </View>
                <View style={styles.kycDetailItem}>
                  <Ionicons name="time-outline" size={16} color="#64748b" />
                  <Text style={styles.kycDetailText}>{new Date(request.submittedAt).toLocaleDateString()}</Text>
                </View>
              </View>

              <View style={styles.kycActions}>
                <TouchableOpacity
                  style={[styles.kycActionButton, styles.approveButton]}
                  onPress={() => handleKYCAction(request.id, "approve")}
                >
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={styles.kycActionText}>Approuver</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.kycActionButton, styles.rejectButton]}
                  onPress={() =>
                    Alert.alert("Rejeter la demande", "Raison du rejet", [
                      { text: "Annuler", style: "cancel" },
                      { text: "Rejeter", onPress: () => handleKYCAction(request.id, "reject", "Documents invalides") },
                    ])
                  }
                >
                  <Ionicons name="close" size={16} color="#fff" />
                  <Text style={styles.kycActionText}>Rejeter</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.kycActionButton, styles.reviewButton]}
                  onPress={() => router.push(`/(admin)/kyc/${request.id}`)}
                >
                  <Ionicons name="eye" size={16} color="#667eea" />
                  <Text style={[styles.kycActionText, { color: "#667eea" }]}>Examiner</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
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
    paddingVertical: 30,
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
    color: "rgba(255,255,255,0.8)",
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  statsContainer: {
    padding: 20,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 15,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardPrimary: {
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  statCardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
  },
  statCardSuccess: {
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },
  statCardInfo: {
    borderLeftWidth: 4,
    borderLeftColor: "#8b5cf6",
  },
  statCardActive: {
    borderLeftWidth: 4,
    borderLeftColor: "#06b6d4",
  },
  statCardDanger: {
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
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
  section: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  seeAllText: {
    fontSize: 14,
    color: "#667eea",
    fontWeight: "600",
  },
  quickActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  actionButton: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    width: "47%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "600",
    marginTop: 8,
    textAlign: "center",
  },
  kycCard: {
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
  kycHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  kycUserInfo: {
    flex: 1,
  },
  kycUserName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 5,
  },
  kycUserEmail: {
    fontSize: 14,
    color: "#64748b",
  },
  riskBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  riskText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  kycDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
    marginBottom: 15,
  },
  kycDetailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  kycDetailText: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: 5,
  },
  kycActions: {
    flexDirection: "row",
    gap: 10,
  },
  kycActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 5,
  },
  approveButton: {
    backgroundColor: "#10b981",
  },
  rejectButton: {
    backgroundColor: "#ef4444",
  },
  reviewButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#667eea",
  },
  kycActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
})
