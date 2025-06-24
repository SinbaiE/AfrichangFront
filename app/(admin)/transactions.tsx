"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Modal } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"

interface Transaction {
  id: string
  userId: string
  userName: string
  type: "exchange" | "deposit" | "withdrawal" | "transfer"
  status: "pending" | "completed" | "failed" | "cancelled"
  amount: number
  currency: string
  targetCurrency?: string
  targetAmount?: number
  fee: number
  rate?: number
  createdAt: string
  completedAt?: string
  reference: string
  description: string
  riskScore: number
  flagged: boolean
}

export default function TransactionsManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [detailModal, setDetailModal] = useState(false)

  useEffect(() => {
    loadTransactions()
  }, [])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchQuery, statusFilter, typeFilter])

  const loadTransactions = async () => {
    try {
      const response = await fetch("/api/admin/transactions")
      const data = await response.json()
      setTransactions(data.transactions || [])
    } catch (error) {
      console.error("Erreur chargement transactions:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterTransactions = () => {
    let filtered = transactions

    if (searchQuery) {
      filtered = filtered.filter(
        (tx) =>
          tx.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
          tx.id.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((tx) => tx.status === statusFilter)
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((tx) => tx.type === typeFilter)
    }

    setFilteredTransactions(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#f59e0b"
      case "completed":
        return "#10b981"
      case "failed":
        return "#ef4444"
      case "cancelled":
        return "#64748b"
      default:
        return "#64748b"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente"
      case "completed":
        return "Terminée"
      case "failed":
        return "Échouée"
      case "cancelled":
        return "Annulée"
      default:
        return status
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "exchange":
        return "swap-horizontal"
      case "deposit":
        return "arrow-down"
      case "withdrawal":
        return "arrow-up"
      case "transfer":
        return "send"
      default:
        return "card"
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case "exchange":
        return "Échange"
      case "deposit":
        return "Dépôt"
      case "withdrawal":
        return "Retrait"
      case "transfer":
        return "Transfert"
      default:
        return type
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const openTransactionDetail = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setDetailModal(true)
  }

  const handleTransactionAction = async (transactionId: string, action: "approve" | "cancel" | "flag") => {
    try {
      const response = await fetch(`/api/admin/transactions/${transactionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        loadTransactions()
        setDetailModal(false)
      }
    } catch (error) {
      console.error("Erreur action transaction:", error)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#1e293b", "#334155"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transactions</Text>
        <TouchableOpacity style={styles.exportButton}>
          <Ionicons name="download-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>2,847</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#f59e0b" }]}>23</Text>
            <Text style={styles.statLabel}>En attente</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#10b981" }]}>2,801</Text>
            <Text style={styles.statLabel}>Terminées</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#ef4444" }]}>23</Text>
            <Text style={styles.statLabel}>Échouées</Text>
          </View>
        </ScrollView>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par utilisateur, référence..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
            {[
              { key: "all", label: "Tous statuts" },
              { key: "pending", label: "En attente" },
              { key: "completed", label: "Terminées" },
              { key: "failed", label: "Échouées" },
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
              { key: "all", label: "Tous types" },
              { key: "exchange", label: "Échanges" },
              { key: "deposit", label: "Dépôts" },
              { key: "withdrawal", label: "Retraits" },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[styles.filterButton, typeFilter === filter.key && styles.filterButtonActive]}
                onPress={() => setTypeFilter(filter.key)}
              >
                <Text style={[styles.filterText, typeFilter === filter.key && styles.filterTextActive]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Transactions List */}
      <ScrollView style={styles.transactionsList} showsVerticalScrollIndicator={false}>
        {filteredTransactions.map((transaction) => (
          <TouchableOpacity
            key={transaction.id}
            style={[styles.transactionCard, transaction.flagged && styles.flaggedCard]}
            onPress={() => openTransactionDetail(transaction)}
          >
            <View style={styles.transactionHeader}>
              <View style={styles.transactionIcon}>
                <Ionicons name={getTypeIcon(transaction.type) as any} size={20} color="#3b82f6" />
              </View>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionUser}>{transaction.userName}</Text>
                <Text style={styles.transactionType}>{getTypeText(transaction.type)}</Text>
              </View>
              <View style={styles.transactionAmount}>
                <Text style={styles.amountText}>{formatAmount(transaction.amount, transaction.currency)}</Text>
                {transaction.targetAmount && (
                  <Text style={styles.targetAmountText}>
                    → {formatAmount(transaction.targetAmount, transaction.targetCurrency!)}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.transactionDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Référence:</Text>
                <Text style={styles.detailValue}>{transaction.reference}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Date:</Text>
                <Text style={styles.detailValue}>{new Date(transaction.createdAt).toLocaleDateString()}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Frais:</Text>
                <Text style={styles.detailValue}>{formatAmount(transaction.fee, transaction.currency)}</Text>
              </View>
            </View>

            <View style={styles.transactionFooter}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) }]}>
                <Text style={styles.statusText}>{getStatusText(transaction.status)}</Text>
              </View>
              {transaction.flagged && (
                <View style={styles.flagBadge}>
                  <Ionicons name="flag" size={12} color="#ef4444" />
                  <Text style={styles.flagText}>Signalée</Text>
                </View>
              )}
              {transaction.riskScore > 70 && (
                <View style={styles.riskBadge}>
                  <Text style={styles.riskText}>Risque: {transaction.riskScore}%</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Transaction Detail Modal */}
      <Modal visible={detailModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Détails de la transaction</Text>
              <TouchableOpacity onPress={() => setDetailModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {selectedTransaction && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.transactionSummary}>
                  <View style={styles.summaryIcon}>
                    <Ionicons name={getTypeIcon(selectedTransaction.type) as any} size={32} color="#3b82f6" />
                  </View>
                  <Text style={styles.summaryAmount}>
                    {formatAmount(selectedTransaction.amount, selectedTransaction.currency)}
                  </Text>
                  {selectedTransaction.targetAmount && (
                    <Text style={styles.summaryTarget}>
                      → {formatAmount(selectedTransaction.targetAmount, selectedTransaction.targetCurrency!)}
                    </Text>
                  )}
                  <View style={[styles.summaryStatus, { backgroundColor: getStatusColor(selectedTransaction.status) }]}>
                    <Text style={styles.summaryStatusText}>{getStatusText(selectedTransaction.status)}</Text>
                  </View>
                </View>

                <View style={styles.detailsSection}>
                  <Text style={styles.sectionTitle}>Informations</Text>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailItemLabel}>ID Transaction:</Text>
                    <Text style={styles.detailItemValue}>{selectedTransaction.id}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailItemLabel}>Utilisateur:</Text>
                    <Text style={styles.detailItemValue}>{selectedTransaction.userName}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailItemLabel}>Type:</Text>
                    <Text style={styles.detailItemValue}>{getTypeText(selectedTransaction.type)}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailItemLabel}>Référence:</Text>
                    <Text style={styles.detailItemValue}>{selectedTransaction.reference}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailItemLabel}>Description:</Text>
                    <Text style={styles.detailItemValue}>{selectedTransaction.description}</Text>
                  </View>
                  {selectedTransaction.rate && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailItemLabel}>Taux de change:</Text>
                      <Text style={styles.detailItemValue}>{selectedTransaction.rate.toFixed(4)}</Text>
                    </View>
                  )}
                  <View style={styles.detailItem}>
                    <Text style={styles.detailItemLabel}>Frais:</Text>
                    <Text style={styles.detailItemValue}>
                      {formatAmount(selectedTransaction.fee, selectedTransaction.currency)}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailItemLabel}>Score de risque:</Text>
                    <Text
                      style={[
                        styles.detailItemValue,
                        { color: selectedTransaction.riskScore > 70 ? "#ef4444" : "#10b981" },
                      ]}
                    >
                      {selectedTransaction.riskScore}%
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailItemLabel}>Créée le:</Text>
                    <Text style={styles.detailItemValue}>
                      {new Date(selectedTransaction.createdAt).toLocaleString()}
                    </Text>
                  </View>
                  {selectedTransaction.completedAt && (
                    <View style={styles.detailItem}>
                      <Text style={styles.detailItemLabel}>Terminée le:</Text>
                      <Text style={styles.detailItemValue}>
                        {new Date(selectedTransaction.completedAt).toLocaleString()}
                      </Text>
                    </View>
                  )}
                </View>

                {selectedTransaction.status === "pending" && (
                  <View style={styles.actionsSection}>
                    <Text style={styles.sectionTitle}>Actions</Text>
                    <View style={styles.modalActions}>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.approveButton]}
                        onPress={() => handleTransactionAction(selectedTransaction.id, "approve")}
                      >
                        <Text style={styles.modalButtonText}>Approuver</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.cancelButton]}
                        onPress={() => handleTransactionAction(selectedTransaction.id, "cancel")}
                      >
                        <Text style={styles.modalButtonText}>Annuler</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.modalButton, styles.flagButton]}
                        onPress={() => handleTransactionAction(selectedTransaction.id, "flag")}
                      >
                        <Text style={[styles.modalButtonText, { color: "#ef4444" }]}>Signaler</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
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
  exportButton: {
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
  transactionsList: {
    flex: 1,
    padding: 20,
  },
  transactionCard: {
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
  flaggedCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  transactionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionUser: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 2,
  },
  transactionType: {
    fontSize: 14,
    color: "#64748b",
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
  },
  targetAmountText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  transactionDetails: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  detailValue: {
    fontSize: 12,
    color: "#1e293b",
    fontWeight: "500",
  },
  transactionFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
  flagBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  flagText: {
    fontSize: 10,
    color: "#ef4444",
    fontWeight: "600",
  },
  riskBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  riskText: {
    fontSize: 10,
    color: "#d97706",
    fontWeight: "600",
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
  transactionSummary: {
    alignItems: "center",
    marginBottom: 30,
  },
  summaryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 5,
  },
  summaryTarget: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 15,
  },
  summaryStatus: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  summaryStatusText: {
    fontSize: 14,
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
  detailItemLabel: {
    fontSize: 14,
    color: "#64748b",
    flex: 1,
  },
  detailItemValue: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
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
  approveButton: {
    backgroundColor: "#10b981",
  },
  cancelButton: {
    backgroundColor: "#ef4444",
  },
  flagButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
})
