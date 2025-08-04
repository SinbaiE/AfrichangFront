"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  Modal,
  Dimensions,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import { useAuth } from "@contexts/AuthContext"
import { useWallet } from "@contexts/WalletContext"

const { width } = Dimensions.get("window")

export default function ProfileScreen() {
  const { user, updateProfile, uploadAvatar, logout } = useAuth()
  const { wallets, getTotalBalance } = useWallet()

  const [isEditing, setIsEditing] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editField, setEditField] = useState("")
  const [editValue, setEditValue] = useState("")
  const [isUploading, setIsUploading] = useState(false)

  const totalBalance = getTotalBalance()
  const mainWallet = wallets.find((w) => w.isDefault)

  const profileStats = [
    {
      label: "Solde Total",
      value: `${totalBalance.toLocaleString()} ${mainWallet?.currency.symbol || "FCFA"}`,
      icon: "wallet-outline",
      color: "#10b981",
    },
    {
      label: "Transactions",
      value: "127",
      icon: "swap-horizontal-outline",
      color: "#3b82f6",
    },
    {
      label: "Économies",
      value: "15.2%",
      icon: "trending-up-outline",
      color: "#8b5cf6",
    },
    {
      label: "Pays Actifs",
      value: "5",
      icon: "globe-outline",
      color: "#f59e0b",
    },
  ]

  const profileSections = [
    {
      title: "Informations Personnelles",
      items: [
        {
          label: "Prénom",
          value: user?.firstName || "",
          field: "firstName",
          icon: "person-outline",
          editable: true,
        },
        {
          label: "Nom",
          value: user?.lastName || "",
          field: "lastName",
          icon: "person-outline",
          editable: true,
        },
        {
          label: "Email",
          value: user?.email || "",
          field: "email",
          icon: "mail-outline",
          editable: true,
        },
        {
          label: "Téléphone",
          value: user?.phone || "",
          field: "phone",
          icon: "call-outline",
          editable: true,
        },
        {
          label: "Pays",
          value: user?.country || "",
          field: "country",
          icon: "location-outline",
          editable: true,
        },
      ],
    },
    {
      title: "Sécurité",
      items: [
        {
          label: "Statut KYC",
          value: getKYCStatusText(user?.kycStatus),
          field: "kycStatus",
          icon: "shield-checkmark-outline",
          editable: false,
          color: getKYCStatusColor(user?.kycStatus),
        },
        {
          label: "Vérification",
          value: user?.isVerified ? "Vérifié" : "Non vérifié",
          field: "isVerified",
          icon: user?.isVerified ? "checkmark-circle-outline" : "close-circle-outline",
          editable: false,
          color: user?.isVerified ? "#10b981" : "#ef4444",
        },
        {
          label: "Membre depuis",
          value: formatDate(user?.createdAt),
          field: "createdAt",
          icon: "calendar-outline",
          editable: false,
        },
      ],
    },
  ]

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission requise", "L'accès à la galerie est nécessaire pour changer votre photo de profil.")
        return
      }

      Alert.alert("Choisir une photo", "D'où voulez-vous sélectionner votre photo ?", [
        { text: "Galerie", onPress: () => pickImageFromGallery() },
        { text: "Caméra", onPress: () => pickImageFromCamera() },
        { text: "Annuler", style: "cancel" },
      ])
    } catch (error) {
      console.error("Image picker error:", error)
    }
  }

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        await handleImageUpload(result.assets[0].uri)
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de sélectionner l'image")
    }
  }

  const pickImageFromCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()
      if (status !== "granted") {
        Alert.alert("Permission requise", "L'accès à la caméra est nécessaire.")
        return
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      })

      if (!result.canceled && result.assets[0]) {
        await handleImageUpload(result.assets[0].uri)
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de prendre la photo")
    }
  }

  const handleImageUpload = async (imageUri: string) => {
    setIsUploading(true)
    try {
      const avatarUrl = await uploadAvatar(imageUri)
      await updateProfile({ avatar: avatarUrl })
      Alert.alert("Succès", "Photo de profil mise à jour !")
    } catch (error) {
      Alert.alert("Erreur", "Impossible de mettre à jour la photo de profil")
    } finally {
      setIsUploading(false)
    }
  }

  const handleEditField = (field: string, currentValue: string) => {
    setEditField(field)
    setEditValue(currentValue)
    setEditModalVisible(true)
  }

  const handleSaveEdit = async () => {
    try {
      await updateProfile({ [editField]: editValue })
      setEditModalVisible(false)
      Alert.alert("Succès", "Profil mis à jour !")
    } catch (error) {
      Alert.alert("Erreur", "Impossible de mettre à jour le profil")
    }
  }

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnexion",
        style: "destructive",
        onPress: logout,
      },
    ])
  }

  function getKYCStatusText(status?: string) {
    switch (status) {
      case "approved":
        return "Approuvé"
      case "rejected":
        return "Rejeté"
      case "pending":
        return "En attente"
      default:
        return "Non soumis"
    }
  }

  function getKYCStatusColor(status?: string) {
    switch (status) {
      case "approved":
        return "#10b981"
      case "rejected":
        return "#ef4444"
      case "pending":
        return "#f59e0b"
      default:
        return "#6b7280"
    }
  }

  function formatDate(dateString?: string) {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header avec photo de profil */}
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
          <View style={styles.profileImageContainer}>
            <TouchableOpacity onPress={handleImagePicker} disabled={isUploading}>
              <View style={styles.profileImageWrapper}>
                {user?.avatar ? (
                  <Image source={{ uri: user.avatar }} style={styles.profileImage} />
                ) : (
                  <View style={styles.defaultAvatar}>
                    <Ionicons name="person" size={50} color="#fff" />
                  </View>
                )}
                <View style={styles.cameraIcon}>
                  <Ionicons name={isUploading ? "hourglass" : "camera"} size={16} color="#fff" />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          <View style={styles.verificationBadge}>
            <Ionicons
              name={user?.isVerified ? "checkmark-circle" : "close-circle"}
              size={16}
              color={user?.isVerified ? "#10b981" : "#ef4444"}
            />
            <Text style={[styles.verificationText, { color: user?.isVerified ? "#10b981" : "#ef4444" }]}>
              {user?.isVerified ? "Compte vérifié" : "Compte non vérifié"}
            </Text>
          </View>
        </LinearGradient>

        {/* Statistiques */}
        <View style={styles.statsContainer}>
          {profileStats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: `${stat.color}20` }]}>
                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Sections du profil */}
        {profileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.profileItem}
                  onPress={() => item.editable && handleEditField(item.field, item.value)}
                  disabled={!item.editable}
                >
                  <View style={styles.profileItemIcon}>
                    <Ionicons name={item.icon as any} size={20} color="#667eea" />
                  </View>

                  <View style={styles.profileItemContent}>
                    <Text style={styles.profileItemLabel}>{item.label}</Text>
                    <Text style={[styles.profileItemValue, item.color && { color: item.color }]}>{item.value}</Text>
                  </View>

                  {item.editable && (
                    <View style={styles.profileItemAction}>
                      <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => console.log("Change password")}>
            <Ionicons name="lock-closed-outline" size={20} color="#667eea" />
            <Text style={styles.actionButtonText}>Changer le mot de passe</Text>
            <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => console.log("Privacy settings")}>
            <Ionicons name="shield-outline" size={20} color="#667eea" />
            <Text style={styles.actionButtonText}>Paramètres de confidentialité</Text>
            <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => console.log("Export data")}>
            <Ionicons name="download-outline" size={20} color="#667eea" />
            <Text style={styles.actionButtonText}>Exporter mes données</Text>
            <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={[styles.actionButtonText, styles.logoutText]}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal d'édition */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier {editField}</Text>

            <TextInput
              style={styles.modalInput}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={`Entrer ${editField}`}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.modalCancelText}>Annuler</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.modalSaveButton} onPress={handleSaveEdit}>
                <Text style={styles.modalSaveText}>Sauvegarder</Text>
              </TouchableOpacity>
            </View>
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
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  profileImageContainer: {
    marginBottom: 20,
  },
  profileImageWrapper: {
    position: "relative",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#fff",
  },
  defaultAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: "#fff",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#667eea",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 15,
  },
  verificationBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  verificationText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 5,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    margin: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 15,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: "#fff",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  profileItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  profileItemContent: {
    flex: 1,
  },
  profileItemLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 5,
  },
  profileItemValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  profileItemAction: {
    alignItems: "center",
    justifyContent: "center",
  },
  actionsContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginLeft: 15,
  },
  logoutButton: {
    marginTop: 10,
  },
  logoutText: {
    color: "#ef4444",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    width: width - 40,
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 20,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    color: "#64748b",
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    borderRadius: 10,
    backgroundColor: "#667eea",
    alignItems: "center",
  },
  modalSaveText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
})
