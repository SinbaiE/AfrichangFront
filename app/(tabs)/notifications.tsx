"use client"

import { useState } from "react"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, RefreshControl, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useNotifications } from "@contexts/NotificationContext"

export default function NotificationsScreen() {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications()

  const [refreshing, setRefreshing] = useState(false)
  const [filter, setFilter] = useState<"all" | "unread">("all")

  // les données de test 

  const   content =  "les enfant doit aller la où tous les monde peu pas les deranger en ce moment precis"
  const tilte = "la vie"

  const onRefresh = () => {
    setRefreshing(true)
    // Recharger les notifications
    setTimeout(() => setRefreshing(false), 1000)
  }

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "unread") return !notif.read
    return true
  })

  const handleMarkAllAsRead = () => {
    Alert.alert("Marquer tout comme lu", "Êtes-vous sûr de vouloir marquer toutes les notifications comme lues ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Confirmer", onPress: markAllAsRead },
    ])
  }

  const handleClearAll = () => {
    Alert.alert("Supprimer toutes les notifications", "Cette action est irréversible.", [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: clearAllNotifications },
    ])
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "kyc":
        return "shield-checkmark-outline"
      case "transaction":
        return "receipt-outline"
      case "exchange":
        return "swap-horizontal-outline"
      case "security":
        return "warning-outline"
      default:
        return "notifications-outline"
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "kyc":
        return "#667eea"
      case "transaction":
        return "#10b981"
      case "exchange":
        return "#f59e0b"
      case "security":
        return "#ef4444"
      default:
        return "#64748b"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#ef4444"
      case "normal":
        return "#f59e0b"
      case "low":
        return "#10b981"
      default:
        return "#64748b"
    }
  }

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return "À l'instant"
    if (minutes < 60) return `Il y a ${minutes}min`
    if (hours < 24) return `Il y a ${hours}h`
    if (days < 7) return `Il y a ${days}j`
    return new Date(timestamp).toLocaleDateString()
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{unreadCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.headerSubtitle}>Restez informé de vos activités</Text>
        </LinearGradient>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, filter === "all" && styles.filterButtonActive]}
              onPress={() => setFilter("all")}
            >
              <Text style={[styles.filterText, filter === "all" && styles.filterTextActive]}>
                Toutes ({notifications.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === "unread" && styles.filterButtonActive]}
              onPress={() => setFilter("unread")}
            >
              <Text style={[styles.filterText, filter === "unread" && styles.filterTextActive]}>
                Non lues ({unreadCount})
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.actionButtons}>
            {unreadCount > 0 && (
              <TouchableOpacity style={styles.actionButton} onPress={handleMarkAllAsRead}>
                <Ionicons name="checkmark-done-outline" size={16} color="#667eea" />
                <Text style={styles.actionButtonText}>Tout marquer</Text>
              </TouchableOpacity>
            )}
            {notifications.length > 0 && (
              <TouchableOpacity style={styles.actionButton} onPress={handleClearAll}>
                <Ionicons name="trash-outline" size={16} color="#ef4444" />
                <Text style={[styles.actionButtonText, { color: "#ef4444" }]}>Supprimer tout</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Notifications List */}
        <View style={styles.notificationsList}>
          {filteredNotifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[styles.notificationCard, !notification.read && styles.notificationCardUnread]}
              onPress={() => markAsRead(notification.id)}
            >
              <View style={styles.notificationHeader}>
                <View
                  style={[styles.notificationIcon, { backgroundColor: `${getNotificationColor(notification.type)}20` }]}
                >
                  <Ionicons
                    name={getNotificationIcon(notification.type) as any}
                    size={20}
                    color={getNotificationColor(notification.type)}
                  />
                </View>

                <View style={styles.notificationContent}>
                  <View style={styles.notificationTitleRow}>
                    <Text style={[styles.notificationTitle, !notification.read && styles.notificationTitleUnread]}>
                      {notification.title}
                    </Text>
                    {notification.priority === "high" && (
                      <View
                        style={[styles.priorityBadge, { backgroundColor: getPriorityColor(notification.priority) }]}
                      >
                        <Text style={styles.priorityText}>!</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.notificationBody}>{notification.body}||{content}</Text>
                  <Text style={styles.notificationTime}>{formatTime(notification.timestamp)}</Text>
                </View>

                <View style={styles.notificationActions}>
                  {!notification.read && <View style={styles.unreadDot} />}
                  <TouchableOpacity style={styles.deleteButton} onPress={() => deleteNotification(notification.id)}>
                    <Ionicons name="close" size={16} color="#94a3b8" />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}

          {filteredNotifications.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={64} color="#94a3b8" />
              <Text style={styles.emptyTitle}>
                {filter === "unread" ? "Aucune notification non lue" : "Aucune notification"}
              </Text>
              <Text style={styles.emptyText}>
                {filter === "unread"
                  ? "Toutes vos notifications ont été lues"
                  : "Vous recevrez ici toutes vos notifications importantes"}
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
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  unreadBadge: {
    backgroundColor: "#ef4444",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 10,
  },
  unreadText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  controlsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterButtons: {
    flexDirection: "row",
    marginBottom: 15,
    gap: 10,
  },
  filterButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
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
  actionButtons: {
    flexDirection: "row",
    gap: 15,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e1e5e9",
    gap: 5,
  },
  actionButtonText: {
    fontSize: 12,
    color: "#667eea",
    fontWeight: "600",
  },
  notificationsList: {
    paddingHorizontal: 20,
  },
  notificationCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationCardUnread: {
    borderLeftWidth: 4,
    borderLeftColor: "#667eea",
    backgroundColor: "#f8faff",
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
  },
  notificationTitleUnread: {
    fontWeight: "bold",
  },
  priorityBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  priorityText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "bold",
  },
  notificationBody: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: "#94a3b8",
  },
  notificationActions: {
    alignItems: "center",
    gap: 10,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#667eea",
  },
  deleteButton: {
    padding: 5,
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
    lineHeight: 24,
  },
})
