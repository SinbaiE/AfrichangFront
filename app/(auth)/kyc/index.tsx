"use client"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useKYC } from "@contexts/KYCContext"

export default function KYCIntroScreen() {
  const { kycData } = useKYC()

  const benefits = [
    {
      icon: "shield-checkmark-outline",
      title: "Sécurité renforcée",
      description: "Protégez votre compte et vos transactions",
    },
    {
      icon: "flash-outline",
      title: "Transactions instantanées",
      description: "Échangez vos devises sans délai",
    },
    {
      icon: "trending-up-outline",
      title: "Limites élevées",
      description: "Accédez à des montants d'échange plus importants",
    },
    {
      icon: "globe-outline",
      title: "Accès complet",
      description: "Utilisez toutes les fonctionnalités d'AfriChange",
    },
  ]

  const requirements = [
    "Pièce d'identité valide (CNI, Passeport, Permis)",
    "Selfie pour vérification biométrique",
    "Informations personnelles complètes",
    "Justificatif de domicile (optionnel)",
  ]

  const handleStartKYC = () => {
    if (kycData.status === "pending_review") {
      Alert.alert(
        "Vérification en cours",
        "Votre dossier est en cours de révision. Vous recevrez une notification dès que la vérification sera terminée.",
      )
      return
    }

    if (kycData.status === "approved") {
      Alert.alert("Compte vérifié", "Votre compte est déjà vérifié !")
      return
    }

    router.push("/(auth)/kyc/personal-info")
  }

  const getStatusColor = () => {
    switch (kycData.status) {
      case "approved":
        return "#4ade80"
      case "pending_review":
        return "#f59e0b"
      case "rejected":
        return "#ef4444"
      default:
        return "#64748b"
    }
  }

  const getStatusText = () => {
    switch (kycData.status) {
      case "approved":
        return "Compte vérifié"
      case "pending_review":
        return "En cours de révision"
      case "rejected":
        return "Vérification rejetée"
      default:
        return "Non vérifié"
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark" size={40} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>Vérification d'identité</Text>
            <Text style={styles.headerSubtitle}>Sécurisez votre compte et débloquez toutes les fonctionnalités</Text>
          </View>
        </LinearGradient>

        {/* Statut actuel */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIndicator, { backgroundColor: getStatusColor() }]} />
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
          {kycData.status === "rejected" && kycData.rejectionReason && (
            <Text style={styles.rejectionReason}>{kycData.rejectionReason}</Text>
          )}
        </View>

        {/* Avantages */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pourquoi vérifier votre identité ?</Text>
          {benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <View style={styles.benefitIcon}>
                <Ionicons name={benefit.icon as any} size={24} color="#667eea" />
              </View>
              <View style={styles.benefitContent}>
                <Text style={styles.benefitTitle}>{benefit.title}</Text>
                <Text style={styles.benefitDescription}>{benefit.description}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Prérequis */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ce dont vous aurez besoin</Text>
          {requirements.map((requirement, index) => (
            <View key={index} style={styles.requirementItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
              <Text style={styles.requirementText}>{requirement}</Text>
            </View>
          ))}
        </View>

        {/* Processus */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Processus de vérification</Text>
          <View style={styles.processSteps}>
            <View style={styles.processStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>Informations personnelles</Text>
            </View>
            <View style={styles.processConnector} />
            <View style={styles.processStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>Document d'identité</Text>
            </View>
            <View style={styles.processConnector} />
            <View style={styles.processStep}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>Vérification biométrique</Text>
            </View>
          </View>
        </View>

        {/* Sécurité */}
        <View style={styles.securityNote}>
          <Ionicons name="lock-closed" size={20} color="#667eea" />
          <Text style={styles.securityText}>
            Vos données sont chiffrées et sécurisées. Nous respectons votre vie privée et ne partageons jamais vos
            informations personnelles.
          </Text>
        </View>

        {/* Bouton d'action */}
        <TouchableOpacity style={styles.startButton} onPress={handleStartKYC}>
          <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.startButtonGradient}>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
            <Text style={styles.startButtonText}>
              {kycData.status === "not_started" ? "Commencer la vérification" : "Continuer la vérification"}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
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
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  headerContent: {
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    lineHeight: 22,
  },
  statusCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  rejectionReason: {
    fontSize: 14,
    color: "#ef4444",
    marginTop: 10,
    fontStyle: "italic",
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "flex-start",
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
  benefitIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e8f2ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 5,
  },
  benefitDescription: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
  },
  requirementItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  requirementText: {
    fontSize: 14,
    color: "#1e293b",
    marginLeft: 12,
    flex: 1,
  },
  processSteps: {
    alignItems: "center",
  },
  processStep: {
    alignItems: "center",
    marginVertical: 10,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#667eea",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  stepNumberText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  stepText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  processConnector: {
    width: 2,
    height: 30,
    backgroundColor: "#e1e5e9",
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#e8f2ff",
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  securityText: {
    fontSize: 14,
    color: "#667eea",
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  startButton: {
    marginHorizontal: 20,
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  bottomSpacer: {
    height: 30,
  },
})
