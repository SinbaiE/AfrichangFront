"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"

interface KYCRequest {
  id: string
  userId: string
  userName: string
  email: string
  status: "pending" | "approved" | "rejected" | "under_review"
  submittedAt: string
  country: string
  documentType: string
  riskScore: number
  documents: {
    idCard?: string
    selfie?: string
    proofOfAddress?: string
  }
  reviewNotes?: string
}

export default function KYCManagement() {
  const [requests, setRequests] = useState<KYCRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<KYCRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedRequest, setSelectedRequest] = useState<KYCRequest | null>(null)
  const [reviewModal, setReviewModal] = useState(false)
  const [reviewNotes, setReviewNotes] = useState("")

  useEffect(() => {
    loadKYCRequests()
  }, [])

  useEffect(() => {
    filterRequests()
  }, [requests, searchQuery, statusFilter])

  const loadKYCRequests = async () => {
    try {
      const response = await fetch("/api/admin/kyc/all")
      const data = await response.json()
      setRequests(data.requests || [])
    } catch (error) {
      console.error("Erreur chargement KYC:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterRequests = () => {
    let filtered = requests

    if (searchQuery) {
      filtered = filtered.filter(
        (req) =>
          req.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((req) => req.status === statusFilter)
    }

    setFilteredRequests(filtered)
  }

  const handleKYCAction = async (requestId: string, action: "approve" | "reject" | "review", notes?: string) => {
    try {
      const response = await fetch(`/api/admin/kyc/${requestId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, notes }),
      })

      if (response.ok) {
        Alert.alert("Succès", `Demande KYC ${getActionText(action)}`)
        loadKYCRequests()
        setReviewModal(false)
        setSelectedRequest(null)
        setReviewNotes("")
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de traiter la demande")
    }
  }

  const getActionText = (action: string) => {
    switch (action) {
      case "approve":
        return "approuvée"
      case "reject":
        return "rejetée"
      case "review":
        return "mise en révision"
      default:
        return "traitée"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#f59e0b"
      case "approved":
        return "#10b981"
      case "rejected":
        return "#ef4444"
      case "under_review":
        return "#3b82f6"
      default:
        return "#64748b"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente"
      case "approved":
        return "Approuvé"
      case "rejected":
        return "Rejeté"
      case "under_review":
        return "En révision"
      default:
        return status
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 80) return "#ef4444"
    if (score >= 50) return "#f59e0b"
    return "#4ade80"
  }

  const openReviewModal = (request: KYCRequest) => {
    setSelectedRequest(request)
    setReviewNotes(request.reviewNotes || "")
    setReviewModal(true)
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#1e293b", "#334155"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gestion KYC</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher par nom ou email..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilters}>
          {[
            { key: "all", label: "Tous", count: requests.length },
            { key: "pending", label: "En attente", count: requests.filter((r) => r.status === "pending").length },
            {
              key: "under_review",
              label: "En révision",
              count: requests.filter((r) => r.status === "under_review").length,
            },
            { key: "approved", label: "Approuvés", count: requests.filter((r) => r.status === "approved").length },
            { key: "rejected", label: "Rejetés", count: requests.filter((r) => r.status === "rejected").length },
          ].map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[styles.statusFilter, statusFilter === filter.key && styles.statusFilterActive]}
              onPress={() => setStatusFilter(filter.key)}
            >
              <Text style={[styles.statusFilterText, statusFilter === filter.key && styles.statusFilterTextActive]}>
                {filter.label} ({filter.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* KYC Requests List */}
      <ScrollView style={styles.requestsList} showsVerticalScrollIndicator={false}>
        {filteredRequests.map((request) => (
          <View key={request.id} style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{request.userName}</Text>
                <Text style={styles.userEmail}>{request.email}</Text>
              </View>
              <View style={styles.badges}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
                  <Text style={styles.statusText}>{getStatusText(request.status)}</Text>
                </View>
                <View style={[styles.riskBadge, { backgroundColor: getRiskColor(request.riskScore) }]}>
                  <Text style={styles.riskText}>{request.riskScore}%</Text>
                </View>
              </View>
            </View>

            <View style={styles.requestDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="location-outline" size={16} color="#64748b" />
                <Text style={styles.detailText}>{request.country}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="card-outline" size={16} color="#64748b" />
                <Text style={styles.detailText}>{request.documentType}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={16} color="#64748b" />
                <Text style={styles.detailText}>{new Date(request.submittedAt).toLocaleDateString()}</Text>
              </View>
            </View>

            {request.reviewNotes && (
              <View style={styles.notesContainer}>
                <Text style={styles.notesLabel}>Notes de révision :</Text>
                <Text style={styles.notesText}>{request.reviewNotes}</Text>
              </View>
            )}

            <View style={styles.requestActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.reviewButton]}
                onPress={() => openReviewModal(request)}
              >
                <Ionicons name="eye" size={16} color="#3b82f6" />
                <Text style={[styles.actionText, { color: "#3b82f6" }]}>Examiner</Text>
              </TouchableOpacity>

              {request.status === "pending" && (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleKYCAction(request.id, "approve")}
                  >
                    <Ionicons name="checkmark" size={16} color="#fff" />
                    <Text style={styles.actionText}>Approuver</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleKYCAction(request.id, "reject", "Documents non conformes")}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                    <Text style={styles.actionText}>Rejeter</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Review Modal */}
      <Modal visible={reviewModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Révision KYC</Text>
              <TouchableOpacity onPress={() => setReviewModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {selectedRequest && (
              <ScrollView style={styles.modalBody}>
                <Text style={styles.modalUserName}>{selectedRequest.userName}</Text>
                <Text style={styles.modalUserEmail}>{selectedRequest.email}</Text>

                <View style={styles.documentsSection}>
                  <Text style={styles.sectionTitle}>Documents soumis :</Text>
                  {Object.entries(selectedRequest.documents).map(([type, url]) => (
                    <TouchableOpacity key={type} style={styles.documentItem}>
                      <Ionicons name="document-outline" size={20} color="#3b82f6" />
                      <Text style={styles.documentText}>{type}</Text>
                      <Ionicons name="eye-outline" size={16} color="#64748b" />
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.notesSection}>
                  <Text style={styles.sectionTitle}>Notes de révision :</Text>
                  <TextInput
                    style={styles.notesInput}
                    multiline
                    numberOfLines={4}
                    placeholder="Ajouter des notes..."
                    value={reviewNotes}
                    onChangeText={setReviewNotes}
                  />
                </View>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.approveButton]}
                    onPress={() => handleKYCAction(selectedRequest.id, "approve", reviewNotes)}
                  >
                    <Text style={styles.modalButtonText}>Approuver</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.reviewButtonModal]}
                    onPress={() => handleKYCAction(selectedRequest.id, "review", reviewNotes)}
                  >
                    <Text style={[styles.modalButtonText, { color: "#3b82f6" }]}>Mettre en révision</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalButton, styles.rejectButton]}
                    onPress={() => handleKYCAction(selectedRequest.id, "reject", reviewNotes)}
                  >
                    <Text style={styles.modalButtonText}>Rejeter</Text>
                  </TouchableOpacity>
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
  headerRight: {
    width: 40,
  },
  filtersContainer: {
    padding: 20,
    backgroundColor: "#fff",
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
  statusFilters: {
    flexDirection: "row",
  },
  statusFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    marginRight: 10,
  },
  statusFilterActive: {
    backgroundColor: "#3b82f6",
  },
  statusFilterText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "600",
  },
  statusFilterTextActive: {
    color: "#fff",
  },
  requestsList: {
    flex: 1,
    padding: 20,
  },
  requestCard: {
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
  requestHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: "#64748b",
  },
  badges: {
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
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  riskText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "bold",
  },
  requestDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 12,
    color: "#64748b",
    marginLeft: 5,
  },
  notesContainer: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 5,
  },
  notesText: {
    fontSize: 14,
    color: "#1e293b",
  },
  requestActions: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 5,
  },
  reviewButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  approveButton: {
    backgroundColor: "#10b981",
  },
  rejectButton: {
    backgroundColor: "#ef4444",
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
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
  modalUserName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 5,
  },
  modalUserEmail: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 20,
  },
  documentsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 10,
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    marginBottom: 8,
  },
  documentText: {
    flex: 1,
    fontSize: 14,
    color: "#1e293b",
    marginLeft: 10,
  },
  notesSection: {
    marginBottom: 20,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    textAlignVertical: "top",
  },
  modalActions: {
    gap: 10,
  },
  modalButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  reviewButtonModal: {
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
