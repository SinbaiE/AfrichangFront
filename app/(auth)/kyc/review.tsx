"use client"

import { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useKYC } from "@contexts/KYCContext"

export default function ReviewScreen() {
  const { kycData, submitKYC, isLoading, previousStep } = useKYC()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    Alert.alert(
      "Confirmer la soumission",
      "Êtes-vous sûr que toutes les informations sont correctes ? Une fois soumis, vous ne pourrez plus modifier votre dossier.",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Confirmer", onPress: performSubmit },
      ],
    )
  }

  const performSubmit = async () => {
    setIsSubmitting(true)
    try {
      await submitKYC()
      router.replace("/(auth)/kyc/success")
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Une erreur est survenue lors de la soumission")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case "national_id":
        return "Carte d'identité nationale"
      case "passport":
        return "Passeport"
      case "driving_license":
        return "Permis de conduire"
      default:
        return type
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
            <Text style={styles.headerTitle}>Révision du dossier</Text>
            <Text style={styles.headerSubtitle}>Étape 4 sur 4</Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "100%" }]} />
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Summary card */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#4ade80" />
              <Text style={styles.summaryTitle}>Dossier complet</Text>
            </View>
            <Text style={styles.summaryText}>
              Votre dossier de vérification est complet. Veuillez vérifier toutes les informations avant soumission.
            </Text>
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={20} color="#667eea" />
              <Text style={styles.sectionTitle}>Informations personnelles</Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/kyc/personal-info")}>
                <Ionicons name="create-outline" size={20} color="#667eea" />
              </TouchableOpacity>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Nom complet</Text>
                <Text style={styles.infoValue}>
                  {kycData.personalInfo.firstName} {kycData.personalInfo.lastName}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Date de naissance</Text>
                <Text style={styles.infoValue}>{kycData.personalInfo.dateOfBirth || "Non renseigné"}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Nationalité</Text>
                <Text style={styles.infoValue}>{kycData.personalInfo.nationality || "Non renseigné"}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Téléphone</Text>
                <Text style={styles.infoValue}>{kycData.personalInfo.phoneNumber}</Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Adresse</Text>
                <Text style={styles.infoValue}>
                  {kycData.personalInfo.address}, {kycData.personalInfo.city}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Profession</Text>
                <Text style={styles.infoValue}>{kycData.personalInfo.occupation}</Text>
              </View>
            </View>
          </View>

          {/* Document Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="card-outline" size={20} color="#667eea" />
              <Text style={styles.sectionTitle}>Document d'identité</Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/kyc/document-upload")}>
                <Ionicons name="create-outline" size={20} color="#667eea" />
              </TouchableOpacity>
            </View>

            <View style={styles.documentInfo}>
              <Text style={styles.documentType}>{getDocumentTypeName(kycData.documentInfo.type)}</Text>

              <View style={styles.documentImages}>
                {kycData.documentInfo.frontImage && (
                  <View style={styles.documentImageContainer}>
                    <Image source={{ uri: kycData.documentInfo.frontImage }} style={styles.documentImage} />
                    <Text style={styles.documentImageLabel}>Face avant</Text>
                  </View>
                )}

                {kycData.documentInfo.backImage && (
                  <View style={styles.documentImageContainer}>
                    <Image source={{ uri: kycData.documentInfo.backImage }} style={styles.documentImage} />
                    <Text style={styles.documentImageLabel}>Face arrière</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Selfie Verification */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="camera-outline" size={20} color="#667eea" />
              <Text style={styles.sectionTitle}>Vérification biométrique</Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/kyc/selfie-verification")}>
                <Ionicons name="create-outline" size={20} color="#667eea" />
              </TouchableOpacity>
            </View>

            <View style={styles.selfieInfo}>
              {kycData.selfieVerification.selfieImage && (
                <View style={styles.selfieContainer}>
                  <Image source={{ uri: kycData.selfieVerification.selfieImage }} style={styles.selfieImage} />
                  <View style={styles.verificationStatus}>
                    <View style={styles.statusItem}>
                      <Ionicons
                        name={kycData.selfieVerification.livenessCheck ? "checkmark-circle" : "close-circle"}
                        size={16}
                        color={kycData.selfieVerification.livenessCheck ? "#4ade80" : "#ef4444"}
                      />
                      <Text style={styles.statusText}>Test de vivacité</Text>
                    </View>
                    <View style={styles.statusItem}>
                      <Ionicons
                        name={kycData.selfieVerification.faceMatch ? "checkmark-circle" : "close-circle"}
                        size={16}
                        color={kycData.selfieVerification.faceMatch ? "#4ade80" : "#ef4444"}
                      />
                      <Text style={styles.statusText}>Correspondance faciale</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Terms and conditions */}
          <View style={styles.termsSection}>
            <View style={styles.termsHeader}>
              <Ionicons name="document-text-outline" size={20} color="#667eea" />
              <Text style={styles.termsTitle}>Conditions d'utilisation</Text>
            </View>
            <Text style={styles.termsText}>
              En soumettant ce dossier, vous acceptez nos conditions d'utilisation et notre politique de
              confidentialité. Vos données personnelles seront traitées conformément aux réglementations en vigueur.
            </Text>
            <TouchableOpacity style={styles.termsLink}>
              <Text style={styles.termsLinkText}>Lire les conditions complètes</Text>
            </TouchableOpacity>
          </View>

          {/* Navigation buttons */}
          <View style={styles.navigationButtons}>
            <TouchableOpacity style={styles.backNavButton} onPress={previousStep}>
              <Ionicons name="arrow-back" size={20} color="#64748b" />
              <Text style={styles.backNavText}>Précédent</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <LinearGradient colors={["#4ade80", "#16a34a"]} style={styles.submitButtonGradient}>
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>Soumettre le dossier</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
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
    paddingTop: 20,
    paddingBottom: 30,
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
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  content: {
    padding: 20,
  },
  summaryCard: {
    backgroundColor: "#f0fdf4",
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#16a34a",
    marginLeft: 10,
  },
  summaryText: {
    fontSize: 14,
    color: "#16a34a",
    lineHeight: 20,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginLeft: 10,
    flex: 1,
  },
  infoGrid: {
    gap: 15,
  },
  infoItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingBottom: 10,
  },
  infoLabel: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 5,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "500",
  },
  documentInfo: {
    alignItems: "center",
  },
  documentType: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 15,
  },
  documentImages: {
    flexDirection: "row",
    gap: 15,
  },
  documentImageContainer: {
    alignItems: "center",
  },
  documentImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
    resizeMode: "cover",
    marginBottom: 8,
  },
  documentImageLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  selfieInfo: {
    alignItems: "center",
  },
  selfieContainer: {
    alignItems: "center",
  },
  selfieImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  verificationStatus: {
    gap: 8,
  },
  statusItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    fontSize: 14,
    color: "#64748b",
    marginLeft: 8,
  },
  termsSection: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  termsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  termsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginLeft: 10,
  },
  termsText: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 20,
    marginBottom: 10,
  },
  termsLink: {
    alignSelf: "flex-start",
  },
  termsLinkText: {
    fontSize: 14,
    color: "#667eea",
    fontWeight: "600",
  },
  navigationButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  backNavButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e1e5e9",
  },
  backNavText: {
    fontSize: 16,
    color: "#64748b",
    marginLeft: 8,
  },
  submitButton: {
    flex: 1,
    marginLeft: 15,
    borderRadius: 15,
    overflow: "hidden",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
})
