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
import * as ImagePicker from "expo-image-picker"
import { Camera } from "expo-camera"

export default function SelfieVerificationScreen() {
  const { kycData, updateSelfieVerification, nextStep, previousStep } = useKYC()
  const [selfieImage, setSelfieImage] = useState(kycData.selfieVerification.selfieImage || null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [livenessCheck, setLivenessCheck] = useState(false)
  const [faceMatch, setFaceMatch] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const livenessSteps = [
    {
      id: "center",
      title: "Regardez droit devant",
      description: "Positionnez votre visage au centre",
      icon: "eye-outline",
    },
    {
      id: "smile",
      title: "Souriez",
      description: "Montrez un léger sourire",
      icon: "happy-outline",
    },
    {
      id: "blink",
      title: "Clignez des yeux",
      description: "Clignez lentement des yeux",
      icon: "eye-off-outline",
    },
  ]

  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permission requise", "L'accès à l'appareil photo est nécessaire pour la vérification biométrique")
      return false
    }
    return true
  }

  const takeSelfie = async () => {
    const hasPermission = await requestCameraPermission()
    if (!hasPermission) return

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
      cameraType: ImagePicker.CameraType.front,
    })

    if (!result.canceled) {
      setSelfieImage(result.assets[0].uri)
      performLivenessCheck(result.assets[0].uri)
    }
  }

  const performLivenessCheck = async (imageUri: string) => {
    setIsProcessing(true)
    try {
      // Simulation du processus de vérification de vivacité
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Simulation des résultats
      const livenessResult = Math.random() > 0.2 // 80% de succès
      const faceMatchResult = Math.random() > 0.1 // 90% de succès

      setLivenessCheck(livenessResult)
      setFaceMatch(faceMatchResult)

      if (livenessResult && faceMatchResult) {
        Alert.alert("Vérification réussie !", "Votre identité a été vérifiée avec succès")
      } else {
        Alert.alert("Vérification échouée", "Veuillez reprendre votre selfie en suivant les instructions", [
          { text: "Réessayer", onPress: () => setSelfieImage(null) },
        ])
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur est survenue lors de la vérification")
    } finally {
      setIsProcessing(false)
    }
  }

  const validateAndNext = () => {
    if (!selfieImage) {
      Alert.alert("Selfie requis", "Veuillez prendre un selfie pour continuer")
      return
    }

    if (!livenessCheck || !faceMatch) {
      Alert.alert("Vérification incomplète", "Veuillez reprendre votre selfie pour une vérification réussie")
      return
    }

    updateSelfieVerification({
      selfieImage: selfieImage,
      livenessCheck: livenessCheck,
      faceMatch: faceMatch,
    })

    nextStep()
    router.push("/(auth)/kyc/review")
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
            <Text style={styles.headerTitle}>Vérification biométrique</Text>
            <Text style={styles.headerSubtitle}>Étape 3 sur 4</Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "75%" }]} />
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Instructions */}
          <View style={styles.instructionsCard}>
            <Ionicons name="camera" size={24} color="#667eea" />
            <View style={styles.instructionsContent}>
              <Text style={styles.instructionsTitle}>Instructions pour le selfie</Text>
              <Text style={styles.instructionsText}>
                • Regardez directement l'appareil photo{"\n"}• Assurez-vous d'être dans un endroit bien éclairé{"\n"}•
                Retirez lunettes de soleil et chapeau{"\n"}• Gardez une expression neutre
              </Text>
            </View>
          </View>

          {/* Liveness steps */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Étapes de vérification</Text>
            {livenessSteps.map((step, index) => (
              <View key={step.id} style={styles.stepCard}>
                <View style={styles.stepIcon}>
                  <Ionicons name={step.icon as any} size={24} color="#667eea" />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDescription}>{step.description}</Text>
                </View>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Selfie capture */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prendre un selfie</Text>

            <View style={styles.selfieContainer}>
              {selfieImage ? (
                <View style={styles.selfiePreview}>
                  <Image source={{ uri: selfieImage }} style={styles.selfieImage} />

                  {/* Verification status */}
                  <View style={styles.verificationOverlay}>
                    {isProcessing ? (
                      <View style={styles.processingIndicator}>
                        <ActivityIndicator size="large" color="#fff" />
                        <Text style={styles.processingText}>Vérification en cours...</Text>
                      </View>
                    ) : (
                      <View style={styles.verificationResults}>
                        <View style={styles.verificationItem}>
                          <Ionicons
                            name={livenessCheck ? "checkmark-circle" : "close-circle"}
                            size={24}
                            color={livenessCheck ? "#4ade80" : "#ef4444"}
                          />
                          <Text style={[styles.verificationText, { color: livenessCheck ? "#4ade80" : "#ef4444" }]}>
                            Test de vivacité
                          </Text>
                        </View>
                        <View style={styles.verificationItem}>
                          <Ionicons
                            name={faceMatch ? "checkmark-circle" : "close-circle"}
                            size={24}
                            color={faceMatch ? "#4ade80" : "#ef4444"}
                          />
                          <Text style={[styles.verificationText, { color: faceMatch ? "#4ade80" : "#ef4444" }]}>
                            Correspondance faciale
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.retakeButton}
                    onPress={() => {
                      setSelfieImage(null)
                      setLivenessCheck(false)
                      setFaceMatch(false)
                    }}
                  >
                    <Ionicons name="refresh" size={20} color="#667eea" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.selfieCapture} onPress={takeSelfie}>
                  <View style={styles.cameraIcon}>
                    <Ionicons name="camera-outline" size={60} color="#64748b" />
                  </View>
                  <Text style={styles.captureText}>Toucher pour prendre un selfie</Text>
                  <Text style={styles.captureSubtext}>Utilisez l'appareil photo frontal</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Security note */}
          <View style={styles.securityNote}>
            <Ionicons name="shield-checkmark" size={20} color="#4ade80" />
            <Text style={styles.securityText}>
              Votre selfie est utilisé uniquement pour vérifier votre identité et sera supprimé après validation. Nous
              utilisons une technologie de reconnaissance faciale sécurisée.
            </Text>
          </View>

          {/* Navigation buttons */}
          <View style={styles.navigationButtons}>
            <TouchableOpacity style={styles.backNavButton} onPress={previousStep}>
              <Ionicons name="arrow-back" size={20} color="#64748b" />
              <Text style={styles.backNavText}>Précédent</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.nextButton, (!selfieImage || !livenessCheck || !faceMatch) && styles.nextButtonDisabled]}
              onPress={validateAndNext}
              disabled={!selfieImage || !livenessCheck || !faceMatch}
            >
              <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.nextButtonGradient}>
                <Text style={styles.nextButtonText}>Continuer</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" />
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
  instructionsCard: {
    flexDirection: "row",
    backgroundColor: "#e8f2ff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  instructionsContent: {
    flex: 1,
    marginLeft: 15,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#667eea",
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: "#667eea",
    lineHeight: 20,
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
  stepCard: {
    flexDirection: "row",
    alignItems: "center",
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
  stepIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 5,
  },
  stepDescription: {
    fontSize: 14,
    color: "#64748b",
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#667eea",
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  selfieContainer: {
    alignItems: "center",
  },
  selfieCapture: {
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#fff",
    borderWidth: 3,
    borderColor: "#e1e5e9",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraIcon: {
    marginBottom: 20,
  },
  captureText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 5,
  },
  captureSubtext: {
    fontSize: 14,
    color: "#94a3b8",
  },
  selfiePreview: {
    position: "relative",
    width: 300,
    height: 300,
    borderRadius: 150,
    overflow: "hidden",
  },
  selfieImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  verificationOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 20,
  },
  processingIndicator: {
    alignItems: "center",
  },
  processingText: {
    color: "#fff",
    fontSize: 14,
    marginTop: 10,
  },
  verificationResults: {
    gap: 10,
  },
  verificationItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  verificationText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 10,
  },
  retakeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "#fff",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f0fdf4",
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
  },
  securityText: {
    fontSize: 14,
    color: "#16a34a",
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
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
  nextButton: {
    flex: 1,
    marginLeft: 15,
    borderRadius: 15,
    overflow: "hidden",
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 8,
  },
})
