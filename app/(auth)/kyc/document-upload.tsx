"use client"

import { useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useKYC } from "@contexts/KYCContext"
import * as ImagePicker from "expo-image-picker"

const documentTypes = [
  {
    id: "national_id",
    title: "Carte d'identité nationale",
    description: "CNI ou carte d'identité biométrique",
    icon: "card-outline",
    requiresBothSides: true,
  },
  {
    id: "passport",
    title: "Passeport",
    description: "Page d'identité du passeport",
    icon: "book-outline",
    requiresBothSides: false,
  },
  {
    id: "driving_license",
    title: "Permis de conduire",
    description: "Permis de conduire valide",
    icon: "car-outline",
    requiresBothSides: true,
  },
]

export default function DocumentUploadScreen() {
  const { kycData, updateDocumentInfo, nextStep, previousStep } = useKYC()
  const [selectedDocType, setSelectedDocType] = useState(kycData.documentInfo.type || "national_id")
  const [frontImage, setFrontImage] = useState(kycData.documentInfo.frontImage || null)
  const [backImage, setBackImage] = useState(kycData.documentInfo.backImage || null)
  const [isUploading, setIsUploading] = useState(false)
  const [documentNumber, setDocumentNumber] = useState(kycData.documentInfo.number || "")
  const [expiryDate, setExpiryDate] = useState(kycData.documentInfo.expiryDate || "")

  const selectedDoc = documentTypes.find((doc) => doc.id === selectedDocType)

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permission requise", "L'accès à la galerie est nécessaire pour télécharger vos documents")
      return false
    }
    return true
  }

  const pickImage = async (side: "front" | "back") => {
    const hasPermission = await requestPermissions()
    if (!hasPermission) return

    Alert.alert("Sélectionner une image", "Comment souhaitez-vous ajouter votre document ?", [
      { text: "Appareil photo", onPress: () => takePhoto(side) },
      { text: "Galerie", onPress: () => pickFromGallery(side) },
      { text: "Annuler", style: "cancel" },
    ])
  }

  const takePhoto = async (side: "front" | "back") => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permission requise", "L'accès à l'appareil photo est nécessaire")
      return
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    })

    if (!result.canceled) {
      if (side === "front") {
        setFrontImage(result.assets[0].uri)
      } else {
        setBackImage(result.assets[0].uri)
      }
    }
  }

  const pickFromGallery = async (side: "front" | "back") => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    })

    if (!result.canceled) {
      if (side === "front") {
        setFrontImage(result.assets[0].uri)
      } else {
        setBackImage(result.assets[0].uri)
      }
    }
  }

  const validateAndNext = () => {
    if (!frontImage) {
      Alert.alert("Document requis", "Veuillez télécharger au moins la face avant de votre document")
      return
    }

    if (selectedDoc?.requiresBothSides && !backImage) {
      Alert.alert("Document incomplet", "Veuillez télécharger les deux faces de votre document")
      return
    }

    // Update document info
    updateDocumentInfo({
      type: selectedDocType as any,
      number: documentNumber,
      expiryDate: expiryDate,
      issuingCountry: kycData.personalInfo.nationality,
      frontImage: frontImage,
      backImage: backImage,
    })

    nextStep()
    router.push("/(auth)/kyc/selfie-verification")
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
            <Text style={styles.headerTitle}>Document d'identité</Text>
            <Text style={styles.headerSubtitle}>Étape 2 sur 4</Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "50%" }]} />
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Instructions */}
          <View style={styles.instructionsCard}>
            <Ionicons name="information-circle" size={24} color="#667eea" />
            <View style={styles.instructionsContent}>
              <Text style={styles.instructionsTitle}>Instructions importantes</Text>
              <Text style={styles.instructionsText}>
                • Assurez-vous que le document est bien éclairé{"\n"}• Évitez les reflets et les ombres{"\n"}• Le texte
                doit être clairement lisible{"\n"}• Utilisez un fond contrasté
              </Text>
            </View>
          </View>

          {/* Document type selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Type de document</Text>
            {documentTypes.map((docType) => (
              <TouchableOpacity
                key={docType.id}
                style={[styles.docTypeCard, selectedDocType === docType.id && styles.docTypeCardSelected]}
                onPress={() => setSelectedDocType(docType.id)}
              >
                <View style={styles.docTypeIcon}>
                  <Ionicons
                    name={docType.icon as any}
                    size={24}
                    color={selectedDocType === docType.id ? "#667eea" : "#64748b"}
                  />
                </View>
                <View style={styles.docTypeContent}>
                  <Text style={[styles.docTypeTitle, selectedDocType === docType.id && styles.docTypeTitleSelected]}>
                    {docType.title}
                  </Text>
                  <Text style={styles.docTypeDescription}>{docType.description}</Text>
                </View>
                <View style={styles.radioButton}>
                  {selectedDocType === docType.id && <View style={styles.radioButtonSelected} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Document upload */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Télécharger le document</Text>

            {/* Front side */}
            <View style={styles.uploadSection}>
              <Text style={styles.uploadLabel}>Face avant {selectedDoc?.requiresBothSides && "*"}</Text>
              <TouchableOpacity style={styles.uploadCard} onPress={() => pickImage("front")}>
                {frontImage ? (
                  <View style={styles.imagePreview}>
                    <Image source={{ uri: frontImage }} style={styles.previewImage} />
                    <TouchableOpacity style={styles.removeImageButton} onPress={() => setFrontImage(null)}>
                      <Ionicons name="close-circle" size={24} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.uploadPlaceholder}>
                    <Ionicons name="camera-outline" size={40} color="#64748b" />
                    <Text style={styles.uploadText}>Toucher pour ajouter</Text>
                    <Text style={styles.uploadSubtext}>Photo ou fichier</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Back side (if required) */}
            {selectedDoc?.requiresBothSides && (
              <View style={styles.uploadSection}>
                <Text style={styles.uploadLabel}>Face arrière *</Text>
                <TouchableOpacity style={styles.uploadCard} onPress={() => pickImage("back")}>
                  {backImage ? (
                    <View style={styles.imagePreview}>
                      <Image source={{ uri: backImage }} style={styles.previewImage} />
                      <TouchableOpacity style={styles.removeImageButton} onPress={() => setBackImage(null)}>
                        <Ionicons name="close-circle" size={24} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.uploadPlaceholder}>
                      <Ionicons name="camera-outline" size={40} color="#64748b" />
                      <Text style={styles.uploadText}>Toucher pour ajouter</Text>
                      <Text style={styles.uploadSubtext}>Photo ou fichier</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Security note */}
          <View style={styles.securityNote}>
            <Ionicons name="shield-checkmark" size={20} color="#4ade80" />
            <Text style={styles.securityText}>
              Vos documents sont chiffrés et stockés de manière sécurisée. Ils ne seront utilisés que pour la
              vérification de votre identité.
            </Text>
          </View>

          {/* Navigation buttons */}
          <View style={styles.navigationButtons}>
            <TouchableOpacity style={styles.backNavButton} onPress={previousStep}>
              <Ionicons name="arrow-back" size={20} color="#64748b" />
              <Text style={styles.backNavText}>Précédent</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.nextButton,
                (!frontImage || (selectedDoc?.requiresBothSides && !backImage)) && styles.nextButtonDisabled,
              ]}
              onPress={validateAndNext}
              disabled={!frontImage || (selectedDoc?.requiresBothSides && !backImage)}
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
  docTypeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  docTypeCardSelected: {
    borderColor: "#667eea",
    backgroundColor: "#f8faff",
  },
  docTypeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  docTypeContent: {
    flex: 1,
  },
  docTypeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 5,
  },
  docTypeTitleSelected: {
    color: "#667eea",
  },
  docTypeDescription: {
    fontSize: 14,
    color: "#64748b",
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#e1e5e9",
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#667eea",
  },
  uploadSection: {
    marginBottom: 20,
  },
  uploadLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 10,
  },
  uploadCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#e1e5e9",
    borderStyle: "dashed",
    overflow: "hidden",
  },
  uploadPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 10,
  },
  uploadSubtext: {
    fontSize: 14,
    color: "#94a3b8",
    marginTop: 5,
  },
  imagePreview: {
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#fff",
    borderRadius: 12,
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
