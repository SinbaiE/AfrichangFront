"use client"

import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#3B82F6", "#1E40AF", "#1E3A8A"]}
        style={styles.gradient}
      >
        <View style={styles.innerContainer}>
          {/* Logo */}
          <View style={styles.logoWrapper}>
            <Ionicons name="swap-horizontal" size={64} color="white" />
          </View>

          {/* Titre principal */}
          <Text style={styles.title}>AfriChange</Text>
          <Text style={styles.subtitle}>L'échange de devises africaines</Text>
          <Text style={styles.slogan}>Simple, rapide et sécurisé</Text>

          {/* Fonctionnalités */}
          <View style={styles.features}>
            <View style={styles.featureItem}>
              <View style={styles.iconWrapper}>
                <Ionicons name="flash" size={20} color="white" />
              </View>
              <Text style={styles.featureText}>Échanges instantanés</Text>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.iconWrapper}>
                <Ionicons name="shield-checkmark" size={20} color="white" />
              </View>
              <Text style={styles.featureText}>100% sécurisé</Text>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.iconWrapper}>
                <Ionicons name="trending-down" size={20} color="white" />
              </View>
              <Text style={styles.featureText}>Frais réduits</Text>
            </View>
          </View>

          {/* Boutons */}
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => router.push("/(auth)/signup")}
            >
              <Text style={styles.primaryButtonText}>Créer un compte</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text style={styles.secondaryButtonText}>Se connecter</Text>
            </TouchableOpacity>
          </View>

          {/* Pays supportés */}
          <View style={styles.flagsContainer}>
            <Text style={styles.flagsLabel}>Pays supportés :</Text>
            <View style={styles.flagsRow}>
              {["🇧🇫", "🇨🇮", "🇬🇭", "🇳🇬", "🇸🇳", "🇰🇪"].map((flag, index) => (
                <Text key={index} style={styles.flag}>
                  {flag}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logoWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 999,
    padding: 32,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    marginBottom: 8,
  },
  slogan: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 48,
  },
  features: {
    marginBottom: 48,
    gap: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  iconWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 999,
    padding: 8,
    marginRight: 16,
  },
  featureText: {
    color: "white",
    fontSize: 18,
  },
  buttonGroup: {
    width: "100%",
    gap: 16,
  },
  primaryButton: {
    backgroundColor: "white",
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: "#2563EB", // text-blue-600
    textAlign: "center",
    fontWeight: "600",
    fontSize: 18,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: "white",
    paddingVertical: 16,
    borderRadius: 12,
  },
  secondaryButtonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 18,
  },
  flagsContainer: {
    marginTop: 32,
  },
  flagsLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    marginBottom: 16,
  },
  flagsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  flag: {
    fontSize: 24,
  },
})
