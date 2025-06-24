"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useLocation } from "@/contexts/LocationContext"

interface LocationVerificationProps {
  expectedCountry?: string
  onVerificationComplete?: (verified: boolean) => void
  showDetails?: boolean
}

export default function LocationVerification({
  expectedCountry,
  onVerificationComplete,
  showDetails = true,
}: LocationVerificationProps) {
  const { location, isLoading, error, requestLocation, verifyLocation, getLocationString } = useLocation()
  const [verificationStatus, setVerificationStatus] = useState<"pending" | "verified" | "failed">("pending")

  useEffect(() => {
    if (location && expectedCountry) {
      const isVerified = verifyLocation(expectedCountry)
      setVerificationStatus(isVerified ? "verified" : "failed")
      onVerificationComplete?.(isVerified)
    }
  }, [location, expectedCountry])

  const handleRetryLocation = () => {
    Alert.alert("Actualiser la localisation", "Voulez-vous actualiser votre position actuelle ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Actualiser", onPress: requestLocation },
    ])
  }

  const getStatusIcon = () => {
    if (isLoading) return "location-outline"
    if (error) return "warning-outline"
    if (verificationStatus === "verified") return "checkmark-circle-outline"
    if (verificationStatus === "failed") return "close-circle-outline"
    return "location-outline"
  }

  const getStatusColor = () => {
    if (isLoading) return "#f59e0b"
    if (error) return "#ef4444"
    if (verificationStatus === "verified") return "#10b981"
    if (verificationStatus === "failed") return "#ef4444"
    return "#64748b"
  }

  const getStatusText = () => {
    if (isLoading) return "Localisation en cours..."
    if (error) return "Erreur de localisation"
    if (verificationStatus === "verified") return "Localisation vérifiée"
    if (verificationStatus === "failed") return "Localisation non conforme"
    return "Localisation requise"
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name={getStatusIcon()} size={24} color={getStatusColor()} />
        <Text style={[styles.statusText, { color: getStatusColor() }]}>{getStatusText()}</Text>
        {!isLoading && (
          <TouchableOpacity onPress={handleRetryLocation} style={styles.refreshButton}>
            <Ionicons name="refresh" size={16} color="#667eea" />
          </TouchableOpacity>
        )}
      </View>

      {showDetails && location && (
        <View style={styles.details}>
          <Text style={styles.locationText}>{getLocationString()}</Text>
          {expectedCountry && verificationStatus === "failed" && (
            <Text style={styles.warningText}>
              Votre localisation ne correspond pas au pays déclaré ({expectedCountry})
            </Text>
          )}
        </View>
      )}

      {error && (
        <TouchableOpacity style={styles.retryButton} onPress={requestLocation}>
          <Text style={styles.retryText}>Réessayer</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#e1e5e9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 10,
    flex: 1,
  },
  refreshButton: {
    padding: 5,
  },
  details: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  locationText: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 5,
  },
  warningText: {
    fontSize: 12,
    color: "#ef4444",
    fontStyle: "italic",
  },
  retryButton: {
    backgroundColor: "#667eea",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
    marginTop: 10,
  },
  retryText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
})
