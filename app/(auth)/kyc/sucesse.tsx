"use client"

import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useEffect, useRef } from "react"

export default function KYCSuccessScreen() {
  const scaleAnim = useRef(new Animated.Value(0)).current
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#4ade80", "#16a34a"]} style={styles.background}>
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.iconContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <Ionicons name="checkmark-circle" size={120} color="#fff" />
          </Animated.View>

          <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
            <Text style={styles.title}>Dossier soumis avec succès !</Text>
            <Text style={styles.subtitle}>
              Votre demande de vérification d'identité a été envoyée. Notre équipe va examiner votre dossier dans les
              plus brefs délais.
            </Text>

            <View style={styles.timelineContainer}>
              <View style={styles.timelineItem}>
                <View style={[styles.timelineIcon, styles.timelineIconCompleted]}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                </View>
                <Text style={styles.timelineText}>Dossier soumis</Text>
              </View>

              <View style={styles.timelineLine} />

              <View style={styles.timelineItem}>
                <View style={[styles.timelineIcon, styles.timelineIconPending]}>
                  <Ionicons name="time" size={16} color="#f59e0b" />
                </View>
                <Text style={styles.timelineText}>En cours de révision</Text>
              </View>

              <View style={styles.timelineLine} />

              <View style={styles.timelineItem}>
                <View style={styles.timelineIcon}>
                  <Ionicons name="shield-checkmark" size={16} color="#94a3b8" />
                </View>
                <Text style={[styles.timelineText, styles.timelineTextPending]}>Compte vérifié</Text>
              </View>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="information-circle" size={24} color="#667eea" />
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Temps de traitement</Text>
                <Text style={styles.infoText}>
                  La vérification prend généralement 24 à 48 heures. Vous recevrez une notification dès que votre compte
                  sera vérifié.
                </Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View style={[styles.buttonContainer, { opacity: fadeAnim }]}>
            <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace("/(tabs)")}>
              <Text style={styles.primaryButtonText}>Retour au tableau de bord</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} onPress={() => router.push("/(auth)/kyc/status")}>
              <Text style={styles.secondaryButtonText}>Suivre le statut</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  iconContainer: {
    marginBottom: 40,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
  },
  timelineContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#94a3b8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  timelineIconCompleted: {
    backgroundColor: "#fff",
  },
  timelineIconPending: {
    backgroundColor: "#fff",
  },
  timelineText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "500",
  },
  timelineTextPending: {
    color: "rgba(255,255,255,0.7)",
  },
  timelineLine: {
    width: 2,
    height: 20,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginLeft: 15,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 20,
  },
  buttonContainer: {
    width: "100%",
    gap: 15,
  },
  primaryButton: {
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#16a34a",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#fff",
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
})
