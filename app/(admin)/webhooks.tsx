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
import { webhookService } from "@services/WebhookService"

interface WebhookEndpoint {
  id: string
  url: string
  events: string[]
  secret: string
  isActive: boolean
  createdAt: string
  lastUsed?: string
  failureCount: number
}

interface WebhookEvent {
  id: string
  event: string
  data: any
  timestamp: string
  status: "pending" | "sent" | "failed" | "retrying"
  attempts: number
  endpoint: string
}

export default function WebhooksManagement() {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([])
  const [events, setEvents] = useState<WebhookEvent[]>([])
  const [stats, setStats] = useState<any>({})
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<WebhookEvent | null>(null)

  // Form states
  const [newEndpointUrl, setNewEndpointUrl] = useState("")
  const [selectedEvents, setSelectedEvents] = useState<string[]>([])

  const availableEvents = [
    "user.registered",
    "user.suspended",
    "kyc.status_changed",
    "transaction.completed",
    "transaction.failed",
    "exchange_rate.updated",
    "wallet.balance_updated",
    "security.login_attempt",
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setEndpoints(webhookService.getEndpoints())
    setEvents(webhookService.getEventLogs().slice(-50)) // Derniers 50 événements
    setStats(webhookService.getStats())
  }

  const handleAddEndpoint = async () => {
    if (!newEndpointUrl || selectedEvents.length === 0) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs")
      return
    }

    try {
      await webhookService.addEndpoint(newEndpointUrl, selectedEvents)
      setNewEndpointUrl("")
      setSelectedEvents([])
      setShowAddModal(false)
      loadData()
      Alert.alert("Succès", "Endpoint webhook ajouté")
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'ajouter l'endpoint")
    }
  }

  const handleToggleEndpoint = async (id: string, isActive: boolean) => {
    try {
      await webhookService.updateEndpoint(id, { isActive: !isActive })
      loadData()
    } catch (error) {
      Alert.alert("Erreur", "Impossible de modifier l'endpoint")
    }
  }

  const handleDeleteEndpoint = async (id: string) => {
    Alert.alert("Confirmer la suppression", "Êtes-vous sûr de vouloir supprimer cet endpoint ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async () => {
          try {
            await webhookService.removeEndpoint(id)
            loadData()
            Alert.alert("Succès", "Endpoint supprimé")
          } catch (error) {
            Alert.alert("Erreur", "Impossible de supprimer l'endpoint")
          }
        },
      },
    ])
  }

  const testEndpoint = async (endpoint: WebhookEndpoint) => {
    try {
      await webhookService.sendEvent("test.webhook", {
        message: "Test webhook from AfriChange",
        timestamp: new Date().toISOString(),
      })
      Alert.alert("Test envoyé", "Vérifiez votre endpoint pour le webhook de test")
    } catch (error) {
      Alert.alert("Erreur", "Impossible d'envoyer le test")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "#10b981"
      case "failed":
        return "#ef4444"
      case "pending":
        return "#f59e0b"
      case "retrying":
        return "#3b82f6"
      default:
        return "#64748b"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "sent":
        return "Envoyé"
      case "failed":
        return "Échoué"
      case "pending":
        return "En attente"
      case "retrying":
        return "Retry"
      default:
        return status
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#1e293b", "#334155"]} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Webhooks</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={20} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalEndpoints || 0}</Text>
            <Text style={styles.statLabel}>Endpoints</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#10b981" }]}>{stats.activeEndpoints || 0}</Text>
            <Text style={styles.statLabel}>Actifs</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#3b82f6" }]}>{stats.totalEvents || 0}</Text>
            <Text style={styles.statLabel}>Événements</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#10b981" }]}>{stats.successfulEvents || 0}</Text>
            <Text style={styles.statLabel}>Succès</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#ef4444" }]}>{stats.failedEvents || 0}</Text>
            <Text style={styles.statLabel}>Échecs</Text>
          </View>
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Endpoints Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Endpoints configurés</Text>
          {endpoints.map((endpoint) => (
            <View key={endpoint.id} style={styles.endpointCard}>
              <View style={styles.endpointHeader}>
                <View style={styles.endpointInfo}>
                  <Text style={styles.endpointUrl}>{endpoint.url}</Text>
                  <Text style={styles.endpointEvents}>{endpoint.events.length} événement(s)</Text>
                </View>
                <View style={styles.endpointActions}>
                  <TouchableOpacity
                    style={[styles.statusToggle, { backgroundColor: endpoint.isActive ? "#10b981" : "#64748b" }]}
                    onPress={() => handleToggleEndpoint(endpoint.id, endpoint.isActive)}
                  >
                    <Text style={styles.statusToggleText}>{endpoint.isActive ? "ON" : "OFF"}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.endpointDetails}>
                <Text style={styles.endpointDetail}>Créé: {new Date(endpoint.createdAt).toLocaleDateString()}</Text>
                {endpoint.lastUsed && (
                  <Text style={styles.endpointDetail}>
                    Dernière utilisation: {new Date(endpoint.lastUsed).toLocaleDateString()}
                  </Text>
                )}
                <Text style={styles.endpointDetail}>Échecs: {endpoint.failureCount}</Text>
              </View>

              <View style={styles.endpointFooter}>
                <TouchableOpacity style={styles.actionButton} onPress={() => testEndpoint(endpoint)}>
                  <Ionicons name="flash" size={16} color="#3b82f6" />
                  <Text style={styles.actionButtonText}>Test</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteEndpoint(endpoint.id)}>
                  <Ionicons name="trash" size={16} color="#ef4444" />
                  <Text style={[styles.actionButtonText, { color: "#ef4444" }]}>Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Recent Events Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Événements récents</Text>
          {events.map((event) => (
            <TouchableOpacity
              key={event.id}
              style={styles.eventCard}
              onPress={() => {
                setSelectedEvent(event)
                setShowEventModal(true)
              }}
            >
              <View style={styles.eventHeader}>
                <Text style={styles.eventType}>{event.event}</Text>
                <View style={[styles.eventStatus, { backgroundColor: getStatusColor(event.status) }]}>
                  <Text style={styles.eventStatusText}>{getStatusText(event.status)}</Text>
                </View>
              </View>
              <Text style={styles.eventEndpoint}>{event.endpoint}</Text>
              <Text style={styles.eventTime}>{new Date(event.timestamp).toLocaleString()}</Text>
              <Text style={styles.eventAttempts}>Tentatives: {event.attempts}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Add Endpoint Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajouter un endpoint</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.inputLabel}>URL de l'endpoint</Text>
              <TextInput
                style={styles.textInput}
                placeholder="https://votre-site.com/webhook"
                value={newEndpointUrl}
                onChangeText={setNewEndpointUrl}
                keyboardType="url"
              />

              <Text style={styles.inputLabel}>Événements à écouter</Text>
              {availableEvents.map((event) => (
                <TouchableOpacity
                  key={event}
                  style={styles.eventOption}
                  onPress={() => {
                    if (selectedEvents.includes(event)) {
                      setSelectedEvents(selectedEvents.filter((e) => e !== event))
                    } else {
                      setSelectedEvents([...selectedEvents, event])
                    }
                  }}
                >
                  <Ionicons
                    name={selectedEvents.includes(event) ? "checkbox" : "square-outline"}
                    size={20}
                    color={selectedEvents.includes(event) ? "#3b82f6" : "#64748b"}
                  />
                  <Text style={styles.eventOptionText}>{event}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.addEndpointButton} onPress={handleAddEndpoint}>
                <Text style={styles.addEndpointButtonText}>Ajouter l'endpoint</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Event Detail Modal */}
      <Modal visible={showEventModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Détails de l'événement</Text>
              <TouchableOpacity onPress={() => setShowEventModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {/* {selectedEvent && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.eventDetailItem}>
                  <Text style={styles.eventDetailLabel}>ID:</Text>
                  <Text style={styles.eventDetailValue}>{selectedEvent.id}</Text>
                </View>
                <View style={styles.eventDetailItem}>
                  <Text style={styles.eventDetailLabel}>Événement:</Text>
                  <Text style={styles.eventDetailValue}>{selectedEvent.event}</Text>
                </View>
                <View style={styles.eventDetailItem}>
                  <Text style={styles.eventDetailLabel}>Statut:</Text>
                  <View style={[styles.eventDetailStatus, { backgroundColor: getStatusColor(selectedEvent.status) }]}>
                    <Text style={styles.eventDetailStatusText}>{getStatusText(selectedEvent.status)}</Text>
                  </View>
                </View>
                <View style={styles.eventDetailItem}>
                  <Text style={styles.eventDetailLabel}>Endpoint:</Text>
                  <Text style={styles.eventDetailValue}>{selectedEvent.endpoint}</Text>
                </View>
                <View style={styles.eventDetailItem}>
                  <Text style={styles.eventDetailLabel}>Tentatives:</Text>
                  <Text style={styles.eventDetailValue}>{selectedEvent.attempts}</Text>
                </View>
                <View style={styles.eventDetailItem}>
                  <Text style={styles.eventDetailLabel}>Timestamp:</Text>
                  <Text style={styles.eventDetailValue}>{new Date(selectedEvent.timestamp).toLocaleString()}</Text>
                </View>
                <View style={styles.eventDetailItem}>
                  <Text style={styles.eventDetailLabel}>Données:</Text>
                  <Text style={styles.eventDetailValue}>{JSON.stringify(selectedEvent.data, null, 2)}</Text>
                </View>
              </ScrollView>
            )} */}
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 15,
  },
  endpointCard: {
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
  endpointHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  endpointInfo: {
    flex: 1,
  },
  endpointUrl: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 5,
  },
  endpointEvents: {
    fontSize: 14,
    color: "#64748b",
  },
  endpointActions: {
    alignItems: "flex-end",
  },
  statusToggle: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusToggleText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  endpointDetails: {
    marginBottom: 15,
  },
  endpointDetail: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 2,
  },
  endpointFooter: {
    flexDirection: "row",
    gap: 15,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  actionButtonText: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "600",
  },
  eventCard: {
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
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  eventType: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
  },
  eventStatus: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  eventStatusText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
  },
  eventEndpoint: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 2,
  },
  eventAttempts: {
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
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
    marginTop: 15,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  eventOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 10,
  },
  eventOptionText: {
    fontSize: 14,
    color: "#1e293b",
  },
  addEndpointButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  addEndpointButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  eventDetailItem: {
    marginBottom: 15,
  },
  eventDetailLabel: {
    fontSize: 14,
    },
  });