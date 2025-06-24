"use client"

import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useOffline } from "@/contexts/OfflineContext"

export default function OfflineIndicator() {
  const { isOnline, pendingActions, syncPendingActions } = useOffline()

  if (isOnline && pendingActions.length === 0) {
    return null
  }

  return (
    <View style={[styles.container, !isOnline && styles.offline]}>
      <View style={styles.content}>
        <Ionicons name={isOnline ? "sync-outline" : "wifi-off-outline"} size={16} color="#fff" />
        <Text style={styles.text}>
          {!isOnline ? "Mode hors-ligne" : `${pendingActions.length} action(s) en attente`}
        </Text>
      </View>

      {isOnline && pendingActions.length > 0 && (
        <TouchableOpacity onPress={syncPendingActions} style={styles.syncButton}>
          <Text style={styles.syncText}>Sync</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 15,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  offline: {
    backgroundColor: "#ef4444",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  text: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 8,
  },
  syncButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  syncText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
})
