"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import type { Transaction } from "@/types"
import { TransactionService } from "@/services/TransactionService"

interface TransactionFilter {
  type: "all" | "exchange" | "deposit" | "withdrawal"
  status: "all" | "pending" | "completed" | "failed"
  period: "all" | "today" | "week" | "month"
}

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<TransactionFilter>({
    type: "all",
    status: "all",
    period: "all",
  })

  useEffect(() => {
    loadTransactions()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [transactions, filter, searchQuery])

  const loadTransactions = async () => {
    setIsLoading(true)
    try {
      const data = await TransactionService.getUserTransactions()
      setTransactions(data || [])
    } catch (error) {
      console.error("Erreur chargement transactions:", error)
      // On pourrait mettre en place un state pour afficher une erreur à l'utilisateur
    } finally {
      setIsLoading(false)
      setRefreshing(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...transactions]

    // Filtre par type
    if (filter.type !== "all") {
      filtered = filtered.filter((t) => t.type === filter.type)
    }

    // Filtre par statut
    if (filter.status !== "all") {
      filtered = filtered.filter((t) => t.status === filter.status)
    }

    // Filtre par période
    if (filter.period !== "all") {
      const now = new Date()
      const filterDate = new Date()

      switch (filter.period) {
        case "today":
          filterDate.setHours(0, 0, 0, 0)
          break
        case "week":
          filterDate.setDate(now.getDate() - 7)
          break
        case "month":
          filterDate.setMonth(now.getMonth() - 1)
          break
      }

      filtered = filtered.filter((t) => new Date(t.createdAt) >= filterDate)
    }

    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.fromCurrency.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.toCurrency.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    setFilteredTransactions(filtered)
  }

  const onRefresh = () => {
    setRefreshing(true)
    loadTransactions()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#10b981"
      case "pending":
        return "#f59e0b"
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
      case "completed":
        return "Terminée"
      case "pending":
        return "En cours"
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
        return "swap-horizontal-outline"
      case "deposit":
        return "arrow-down-outline"
      case "withdrawal":
        return "arrow-up-outline"
      case "transfer":
        return "send-outline"
      default:
        return "receipt-outline"
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
    return `${amount.toLocaleString()} ${currency}`
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
          <Text style={styles.headerTitle}>Historique des transactions</Text>
          <Text style={styles.headerSubtitle}>Suivez toutes vos opérations</Text>
        </LinearGradient>

        {/* Search and Filters */}
        <View style={styles.filtersContainer}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#64748b" />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher par référence ou devise..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* Filter Buttons */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {/* Type Filter */}
            <View style={styles.filterGroup}>
              {["all", "exchange", "deposit", "withdrawal"].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.filterButton, filter.type === type && styles.filterButtonActive]}
                  onPress={() => setFilter((prev) => ({ ...prev, type: type as any }))}
                >
                  <Text style={[styles.filterText, filter.type === type && styles.filterTextActive]}>
                    {type === "all" ? "Tous" : getTypeText(type)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Status Filter */}
            <View style={styles.filterGroup}>
              {["all", "completed", "pending", "failed"].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[styles.filterButton, filter.status === status && styles.filterButtonActive]}
                  onPress={() => setFilter((prev) => ({ ...prev, status: status as any }))}
                >
                  <Text style={[styles.filterText, filter.status === status && styles.filterTextActive]}>
                    {status === "all" ? "Tous" : getStatusText(status)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{filteredTransactions.length}</Text>
            <Text style={styles.summaryLabel}>Transactions</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {filteredTransactions.filter((t) => t.status === "completed").length}
            </Text>
            <Text style={styles.summaryLabel}>Réussies</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {filteredTransactions
                .filter((t) => t.status === "completed")
                .reduce((sum, t) => sum + t.fromAmount, 0)
                .toLocaleString()}
            </Text>
            <Text style={styles.summaryLabel}>Volume total</Text>
          </View>
        </View>

        {/* Transactions List */}
        <View style={styles.transactionsList}>
          {filteredTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionCard}>
              <View style={styles.transactionHeader}>
                <View style={styles.transactionIcon}>
                  <Ionicons name={getTypeIcon(transaction.type) as any} size={20} color="#667eea" />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionType}>{getTypeText(transaction.type)}</Text>
                  <Text style={styles.transactionReference}>#{transaction.reference}</Text>
                </View>
                <View style={styles.transactionStatus}>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) }]}>
                    <Text style={styles.statusText}>{getStatusText(transaction.status)}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.transactionDetails}>
                <View style={styles.transactionAmounts}>
                  <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Montant envoyé:</Text>
                    <Text style={styles.amountValue}>
                      {formatAmount(transaction.fromAmount, transaction.fromCurrency)}
                    </Text>
                  </View>
                  {transaction.type === "exchange" && (
                    <View style={styles.amountRow}>
                      <Text style={styles.amountLabel}>Montant reçu:</Text>
                      <Text style={[styles.amountValue, styles.amountReceived]}>
                        {formatAmount(transaction.toAmount, transaction.toCurrency)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.amountRow}>
                    <Text style={styles.amountLabel}>Frais:</Text>
                    <Text style={styles.amountValue}>{formatAmount(transaction.fee, transaction.fromCurrency)}</Text>
                  </View>
                </View>

                <View style={styles.transactionMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="time-outline" size={14} color="#64748b" />
                    <Text style={styles.metaText}>{new Date(transaction.createdAt).toLocaleString()}</Text>
                  </View>
                  {transaction.type === "exchange" && (
                    <View style={styles.metaItem}>
                      <Ionicons name="trending-up-outline" size={14} color="#64748b" />
                      <Text style={styles.metaText}>Taux: {transaction.rate.toFixed(4)}</Text>
                    </View>
                  )}
                </View>
              </View>

              {transaction.status === "pending" && (
                <View style={styles.transactionActions}>
                  <TouchableOpacity style={styles.actionButton}>
                    <Text style={styles.actionButtonText}>Suivre</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}

          {filteredTransactions.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={64} color="#94a3b8" />
              <Text style={styles.emptyTitle}>Aucune transaction</Text>
              <Text style={styles.emptyText}>
                {searchQuery || filter.type !== "all" || filter.status !== "all"
                  ? "Aucune transaction ne correspond à vos critères"
                  : "Vous n'avez pas encore effectué de transaction"}
              </Text>
            </View>
          )}
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
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    marginLeft: 10,
  },
  filterScroll: {
    marginBottom: 10,
  },
  filterGroup: {
    flexDirection: "row",
    marginRight: 15,
  },
  filterButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e1e5e9",
  },
  filterButtonActive: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  filterText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#fff",
  },
  summaryContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 15,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
  transactionsList: {
    paddingHorizontal: 20,
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
  transactionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 5,
  },
  transactionReference: {
    fontSize: 12,
    color: "#64748b",
  },
  transactionStatus: {
    alignItems: "flex-end",
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
  transactionDetails: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 15,
  },
  transactionAmounts: {
    marginBottom: 15,
  },
  amountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  amountValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  amountReceived: {
    color: "#10b981",
  },
  transactionMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: 5,
  },
  transactionActions: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 15,
    alignItems: "flex-end",
  },
  actionButton: {
    backgroundColor: "#667eea",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
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
