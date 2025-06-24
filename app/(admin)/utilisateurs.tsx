"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  status: "active" | "suspended" | "pending" | "blocked"
  kycStatus: "pending" | "approved" | "rejected" | "not_started"
  registeredAt: string
  lastLoginAt?: string
  totalTransactions: number
  totalVolume: number
  riskScore: number
  isVerified: boolean
  avatar?: string
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [kycFilter, setKycFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userModal, setUserModal] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery, statusFilter, kycFilter])

  const loadUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      const data = await response.json()
      setUsers(data.users || [])
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.phone.includes(searchQuery),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter)
    }

    if (kycFilter !== "all") {
      filtered = filtered.filter((user) => user.kycStatus === kycFilter)
    }

    setFilteredUsers(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "#10b981"
      case "suspended":
        return "#f59e0b"
      case "pending":
        return "#3b82f6"
      case "blocked":
        return "#ef4444"
      default:
        return "#64748b"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Actif"
      case "suspended":
        return "Suspendu"
      case "pending":
        return "En attente"
      case "blocked":
        return "Bloqué"
      default:
        return status
    }
  }

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "#10b981"
      case "pending":
        return "#f59e0b"
      case "rejected":
        return "#ef4444"
      case "not_started":
        return "#64748b"
      default:
        return "#64748b"
    }
  }

  const getKYCStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "Vérifié"
      case "pending":
        return "En attente"
      case "rejected":
        return "Rejeté"
      case "not_started":
        return "Non démarré"
      default:
        return status
    }
  }

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const openUserDetail = (user: User) => {
    setSelectedUser(user)
    setUserModal(true)
  }

  const handleUserAction = async (userId: string, action: "suspend" | "activate" | "block" | "unblock") => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        Alert.alert(
          "Succès",
          `Utilisateur ${action === "suspend" ? "suspendu" : action === "activate" ? "activé" : action === "block" ? "bloqué" : "débloqué"}`,
        )
        loadUsers()
        setUserModal(false)
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'effectuer cette action")
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#1e293b", "#334155"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Utilisateurs</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="person-add-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>1,247</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#10b981" }]}>1,198</Text>
            <Text style={styles.statLabel}>Actifs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#f59e0b" }]}>23</Text>
            <Text style={styles.statLabel}>Suspendus</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#3b82f6" }]}>156</Text>
            <Text style={styles.statLabel}>KYC Pending</Text>
          </View>
        </ScrollView>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par nom, email, téléphone..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
            {[
              { key: "all", label: "Tous statuts" },
              { key: "active", label: "Actifs" },
              { key: "suspended", label: "Suspendus" },
              { key: "blocked", label: "Bloqués" },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[styles.filterButton, statusFilter === filter.key && styles.filterButtonActive]}
                onPress={() => setStatusFilter(filter.key)}
              >
                <Text style={[styles.filterText, statusFilter === filter.key && styles.filterTextActive]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
            {[
              { key: "all", label: "Tous KYC" },
              { key: "approved", label: "Vérifiés" },
              { key: "pending", label: "En attente" },
              { key: "rejected", label: "Rejetés" },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[styles.filterButton, kycFilter === filter.key && styles.filterButtonActive]}
                onPress={() => setKycFilter(filter.key)}
              >
                <Text style={[styles.filterText, kycFilter === filter.key && styles.filterTextActive]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Users List */}
      <ScrollView style={styles.usersList} showsVerticalScrollIndicator={false}>
        {filteredUsers.map((user) => (
          <TouchableOpacity key={user.id} style={styles.userCard} onPress={() => openUserDetail(user)}>
            <View style={styles.userHeader}>
              <View style={styles.userAvatar}>
                <Text style={styles.avatarText}>
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </Text>
              </View>
              <View style={styles.userInfo}>
                <View style={styles.userNameRow}>
                  <Text style={styles.userName}>
                    {user.firstName} {user.lastName}
                  </Text>
                  {user.isVerified && <Ionicons name="checkmark-circle" size={16} color="#10b981" />}
                </View>
                <Text style={styles.userEmail}>{user.email}</Text>
                <Text style={styles.userPhone}>{user.phone}</Text>
              </View>
              <View style={styles.userBadges}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(user.status)}</Text>
                </View>
                <View style={[styles.kycBadge, { backgroundColor: getKYCStatusColor(user.kycStatus) }]}>
                  <Text style={styles.kycText}>{getKYCStatusText(user.kycStatus)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.userStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{user.totalTransactions}</Text>
                <Text style={styles.statLabel}>Transactions</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatAmount(user.totalVolume)}</Text>
                <Text style={styles.statLabel}>Volume</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: user.riskScore > 70 ? "#ef4444" : "#10b981" }]}>
                  {user.riskScore}%
                </Text>
                <Text style={styles.statLabel}>Risque</Text>
              </View>
            </View>

            <View style={styles.userFooter}>
              <Text style={styles.registeredText}>Inscrit le {new Date(user.registeredAt).toLocaleDateString()}</Text>
              {user.lastLoginAt && (
                <Text style={styles.lastLoginText}>
                  Dernière connexion: {new Date(user.lastLoginAt).toLocaleDateString()}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* User Detail Modal */}
      <Modal visible={userModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Détails utilisateur</Text>
              <TouchableOpacity onPress={() => setUserModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {selectedUser && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.userProfile}>
                  <View style={styles.profileAvatar}>
                    <Text style={styles.profileAvatarText}>
                      {selectedUser.firstName.charAt(0)}
                      {selectedUser.lastName.charAt(0)}
                    </Text>
                  </View>
                  <Text style={styles.profileName}>
                    {selectedUser.firstName} {selectedUser.lastName}
                  </Text>
                  <Text style={styles.profileEmail}>{selectedUser.email}</Text>
                  <View style={styles.profileBadges}>
                    <View style={[styles.profileStatusBadge, { backgroundColor: getStatusColor(selectedUser.status) }]}>
                      <Text style={styles.profileStatusText}>{getStatusText(selectedUser.status)}</Text>
                    </View>
                    <View
                      style={[styles.profileKycBadge, { backgroundColor: getKYCStatusColor(selectedUser.kycStatus) }]}
                    >
                      <Text style={styles.profileKycText}>{getKYCStatusText(selectedUser.kycStatus)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.detailsSection}>
                  <Text style={styles.sectionTitle}>Informations personnelles</Text>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Téléphone:</Text>
                    <Text style={styles.detailValue}>{selectedUser.phone}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Pays:</Text>
                    <Text style={styles.detailValue}>{selectedUser.country}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Inscrit le:</Text>
                    <Text style={styles.detailValue}>{new Date(selectedUser.registeredAt).toLocaleDateString()}</Text>
                  </View>
                  {selectedUser.lastLoginAt && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailLabel}>Dernière connexion:</Text>
                      <Text style={styles.detailValue}>{new Date(selectedUser.lastLoginAt).toLocaleDateString()}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.statsSection}>
                  <Text style={styles.sectionTitle}>Statistiques</Text>
                  <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                      <Text style={styles.statBoxNumber}>{selectedUser.totalTransactions}</Text>
                      <Text style={styles.statBoxLabel}>Transactions</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statBoxNumber}>{formatAmount(selectedUser.totalVolume)}</Text>
                      <Text style={styles.statBoxLabel}>Volume total</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text
                        style={[styles.statBoxNumber, { color: selectedUser.riskScore > 70 ? "#ef4444" : "#10b981" }]}
                      >
                        {selectedUser.riskScore}%
                      </Text>
                      <Text style={styles.statBoxLabel}>Score de risque</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.actionsSection}>
                  <Text style={styles.sectionTitle}>Actions</Text>
                  <View style={styles.modalActions}>
                    {selectedUser.status === "active" ? (
                      <TouchableOpacity
                        style={[styles.modalButton, styles.suspendButton]}
                        onPress={() => handleUserAction(selectedUser.id, "suspend")}
                      >
                        <Text style={styles.modalButtonText}>Suspendre</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.modalButton, styles.activateButton]}
                        onPress={() => handleUserAction(selectedUser.id, "activate")}
                      >
                        <Text style={styles.modalButtonText}>Activer</Text>
                      </TouchableOpacity>
                    )}

                    {selectedUser.status !== "blocked" ? (
                      <TouchableOpacity
                        style={[styles.modalButton, styles.blockButton]}
                        onPress={() => handleUserAction(selectedUser.id, "block")}
                      >
                        <Text style={styles.modalButtonText}>Bloquer</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[styles.modalButton, styles.unblockButton]}
                        onPress={() => handleUserAction(selectedUser.id, "unblock")}
                      >
                        <Text style={styles.modalButtonText}>Débloquer</Text>
                      </TouchableOpacity>
                    )}

                    <TouchableOpacity
                      style={[styles.modalButton, styles.viewTransactionsButton]}
                      onPress={() => {
                        setUserModal(false)
                        router.push(`/(admin)/transactions/${selectedUser.id}`)
                      }}
                    >
                      <Text style={[styles.modalButtonText, { color: "#3b82f6" }]}>Voir transactions</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  statsContainer: {
    paddingVertical: 20,
    paddingLeft: 20,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginRight: 15,
    minWidth: 100,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  filtersContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#1e293b",
  },
  filterRow: {
    marginBottom: 10,
  },
  filters: {
    flexDirection: "row",
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: "#3b82f6",
  },
  filterText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  filterTextActive: {
    color: "#fff",
  },
  usersList: {
    flex: 1,
    padding: 20,
  },
  userCard: {
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
  userHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginRight: 8,
  },
  userEmail: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: "#64748b",
  },
  userBadges: {
    alignItems: "flex-end",
    gap: 5,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  kycBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  kycText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
  },
  userStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    marginBottom: 15,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 2,
  },
  userFooter: {
    gap: 5,
  },
  registeredText: {
    fontSize: 12,
    color: "#64748b",
  },
  lastLoginText: {
    fontSize: 12,
    color: "#64748b",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  modalBody: {
    padding: 20,
  },
  userProfile: {
    alignItems: "center",
    marginBottom: 30,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  profileAvatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 15,
  },
  profileBadges: {
    flexDirection: "row",
    gap: 10,
  },
  profileStatusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  profileStatusText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
  profileKycBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  profileKycText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  detailsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  detailLabel: {
    fontSize: 14,
    color: "#64748b",
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
  },
  statsSection: {
    marginBottom: 30,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 15,
    borderRadius: 12,
    minWidth: 80,
  },
  statBoxNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 5,
  },
  statBoxLabel: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
  actionsSection: {
    marginBottom: 20,
  },
  modalActions: {
    gap: 10,
  },
  modalButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  suspendButton: {
    backgroundColor: "#f59e0b",
  },
  activateButton: {
    backgroundColor: "#10b981",
  },
  blockButton: {
    backgroundColor: "#ef4444",
  },
  unblockButton: {
    backgroundColor: "#10b981",
  },
  viewTransactionsButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
})
