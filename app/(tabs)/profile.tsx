"use client"

import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  ScrollView,
  Animated,
  Alert,
  Modal,
  ActivityIndicator,
  Dimensions,
  Image,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import * as ImagePicker from "expo-image-picker"
import * as Haptics from "expo-haptics"
import { useAuth } from "@/contexts/AuthContext"

interface ValidationErrors {
  name?: string
  email?: string
  phone?: string
}

type ValidationField = "name" | "email" | "phone"

interface ThemeColors {
  background: string
  cardBackground: string
  text: string
  subText: string
  border: string
}

const { width } = Dimensions.get("window")

export default function ProfileScreen() {
  // États principaux
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSecurityModal, setShowSecurityModal] = useState(false)

  // Données utilisateur depuis le contexte
  const { user, updateProfile, uploadAvatar, logout } = useAuth()

  // États temporaires pour l'édition
  const [tempData, setTempData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    avatar: user?.avatar || null,
  })
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [biometricEnabled, setBiometricEnabled] = useState(false)

  // Validation des erreurs
  const [errors, setErrors] = useState<ValidationErrors>({})

  // Animations
  const [fadeAnim] = useState(new Animated.Value(0))
  const [slideAnim] = useState(new Animated.Value(0))

  useEffect(() => {
    if (user) {
      setTempData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        avatar: user.avatar || null,
      })
    }
  }, [user])

  const validateField = (field: ValidationField, value: string): void => {
    const newErrors: ValidationErrors = { ...errors }
    if (field === "phone") {
      const phoneRegex = /^\+[1-9]\d{1,14}$/
      if (!phoneRegex.test(value)) {
        newErrors.phone = "Numéro de téléphone invalide"
      } else {
        delete newErrors.phone
      }
    }
    setErrors(newErrors)
  }

  const toggleEdit = () => {
    if (isEditing) {
      setShowConfirmModal(true)
    } else {
      setIsEditing(true)
      if (user) {
        setTempData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          phone: user.phone || "",
          avatar: user.avatar || null,
        })
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start()
    }
  }

  const handleSave = async () => {
    if (Object.keys(errors).length > 0) {
      Alert.alert("Erreur", "Veuillez corriger les erreurs avant de sauvegarder")
      return
    }
    setIsLoading(true)
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
    try {
      await updateProfile(tempData)
      setIsEditing(false)
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start()
      Alert.alert("Succès", "Profil mis à jour avec succès!")
    } catch (error) {
      Alert.alert("Erreur", "Impossible de sauvegarder les modifications")
    } finally {
      setIsLoading(false)
    }
  }

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      Alert.alert("Permission requise", "L'accès à la galerie est nécessaire.")
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    })
    if (!result.canceled && result.assets?.[0]?.uri) {
      const uri = result.assets[0].uri
      setIsLoading(true)
      try {
        await uploadAvatar(uri)
        Alert.alert("Succès", "Photo de profil mise à jour.")
      } catch (error) {
        Alert.alert("Erreur", "Impossible de mettre à jour la photo.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const cancelEdit = () => {
    setIsEditing(false)
    if (user) {
      setTempData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
        avatar: user.avatar || null,
      })
    }
    setErrors({})
    setShowConfirmModal(false)
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start()
  }

  const themeColors: ThemeColors = {
    background: isDarkMode ? "#1a1a1a" : "#f8fafc",
    cardBackground: isDarkMode ? "#2d2d2d" : "#fff",
    text: isDarkMode ? "#fff" : "#1e293b",
    subText: isDarkMode ? "#a0a0a0" : "#64748b",
    border: isDarkMode ? "#404040" : "#e1e5e9",
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={isDarkMode ? ["#4c1d95", "#7c3aed"] : ["#667eea", "#764ba2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.avatarContainer}
            onPress={isEditing ? handleImagePicker : undefined}
            activeOpacity={isEditing ? 0.7 : 1}
          >
            <View style={styles.avatarPlaceholder}>
              {tempData.avatar ? (
                <Image source={{ uri: tempData.avatar }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={40} color="#fff" />
              )}
              {isEditing && (
                <View style={styles.cameraOverlay}>
                  <Ionicons name="camera" size={20} color="#fff" />
                </View>
              )}
            </View>
            <View style={styles.onlineIndicator} />
            {user.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={12} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
          <Text style={styles.name}>{isEditing ? `${tempData.firstName} ${tempData.lastName}` : `${user.firstName} ${user.lastName}`}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.badgesContainer}>
            <View style={styles.badge}><Ionicons name="star" size={12} color="#ffd700" /><Text style={styles.badgeText}>Premium</Text></View>
            <View style={styles.badge}><Ionicons name="shield-checkmark" size={12} color="#4ade80" /><Text style={styles.badgeText}>Vérifié</Text></View>
          </View>
          <TouchableOpacity
            style={[styles.editButton, isLoading && styles.editButtonDisabled]}
            onPress={toggleEdit}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name={isEditing ? "close" : "create-outline"} size={20} color="#fff" />}
            <Text style={styles.editButtonText}>{isLoading ? "Sauvegarde..." : isEditing ? "Annuler" : "Modifier"}</Text>
          </TouchableOpacity>
        </LinearGradient>

        <View style={[styles.section, { backgroundColor: themeColors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person-outline" size={20} color="#667eea" />
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Informations personnelles</Text>
          </View>
          {!isEditing ? (
            <>
              <View style={styles.infoItem}><Text style={[styles.infoLabel, { color: themeColors.subText }]}>Nom complet</Text><Text style={[styles.infoValue, { color: themeColors.text }]}>{user.firstName} {user.lastName}</Text></View>
              <View style={styles.infoItem}><Text style={[styles.infoLabel, { color: themeColors.subText }]}>Email</Text><View style={styles.infoWithIcon}><Text style={[styles.infoValue, { color: themeColors.text }]}>{user.email}</Text>{user.isVerified && <Ionicons name="checkmark-circle" size={16} color="#4ade80" />}</View></View>
              <View style={styles.infoItem}><Text style={[styles.infoLabel, { color: themeColors.subText }]}>Téléphone</Text><Text style={[styles.infoValue, { color: themeColors.text }]}>{user.phone}</Text></View>
            </>
          ) : (
            <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [50, 0] }) }] }}>
              <View style={styles.inputContainer}><Text style={[styles.label, { color: themeColors.text }]}>Prénom</Text><TextInput style={[styles.input, { backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }]} value={tempData.firstName} onChangeText={(value) => setTempData({ ...tempData, firstName: value })} placeholder="Entrez votre prénom" placeholderTextColor={themeColors.subText} /></View>
              <View style={styles.inputContainer}><Text style={[styles.label, { color: themeColors.text }]}>Nom</Text><TextInput style={[styles.input, { backgroundColor: themeColors.background, borderColor: themeColors.border, color: themeColors.text }]} value={tempData.lastName} onChangeText={(value) => setTempData({ ...tempData, lastName: value })} placeholder="Entrez votre nom" placeholderTextColor={themeColors.subText} /></View>
              <View style={styles.inputContainer}><Text style={[styles.label, { color: themeColors.text }]}>Téléphone</Text><TextInput style={[styles.input, { backgroundColor: themeColors.background, borderColor: errors.phone ? "#ff4757" : themeColors.border, color: themeColors.text }]} value={tempData.phone} onChangeText={(value) => { setTempData({ ...tempData, phone: value }); validateField("phone", value); }} placeholder="Entrez votre téléphone" placeholderTextColor={themeColors.subText} keyboardType="phone-pad" />{errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}</View>
            </Animated.View>
          )}
        </View>

        {isEditing && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <TouchableOpacity style={[styles.saveButton, isLoading && styles.saveButtonDisabled]} onPress={handleSave} activeOpacity={0.8} disabled={isLoading}>
              <LinearGradient colors={isDarkMode ? ["#4c1d95", "#7c3aed"] : ["#667eea", "#764ba2"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.saveButtonGradient}>
                {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <Ionicons name="checkmark-outline" size={20} color="#fff" />}
                <Text style={styles.saveButtonText}>{isLoading ? "Sauvegarde..." : "Enregistrer"}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={[styles.section, { backgroundColor: themeColors.cardBackground }]}>
          <TouchableOpacity style={styles.actionItem} onPress={logout}><View style={styles.actionLeft}><View style={[styles.actionIcon, { backgroundColor: "#ffe8e8" }]}><Ionicons name="log-out-outline" size={20} color="#ff4757" /></View><Text style={[styles.actionLabel, { color: "#ff4757" }]}>Se déconnecter</Text></View><Ionicons name="chevron-forward" size={20} color={themeColors.subText} /></TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { alignItems: "center", paddingVertical: 40, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30, marginBottom: 20 },
  avatarContainer: { position: "relative", marginBottom: 15 },
  avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "rgba(255,255,255,0.3)", overflow: "hidden" },
  avatarImage: { width: "100%", height: "100%", borderRadius: 40 },
  cameraOverlay: { position: "absolute", bottom: 0, right: 0, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 15, width: 30, height: 30, alignItems: "center", justifyContent: "center" },
  onlineIndicator: { position: "absolute", bottom: 5, right: 5, width: 16, height: 16, borderRadius: 8, backgroundColor: "#4ade80", borderWidth: 2, borderColor: "#fff" },
  verifiedBadge: { position: "absolute", top: -5, right: -5, width: 24, height: 24, borderRadius: 12, backgroundColor: "#4ade80", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  name: { fontSize: 24, fontWeight: "bold", color: "#fff", marginBottom: 5 },
  email: { fontSize: 16, color: "rgba(255,255,255,0.8)", marginBottom: 15 },
  badgesContainer: { flexDirection: "row", marginBottom: 20 },
  badge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, marginHorizontal: 5 },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600", marginLeft: 4 },
  editButton: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  editButtonDisabled: { opacity: 0.6 },
  editButtonText: { color: "#fff", fontWeight: "600", marginLeft: 8, fontSize: 16 },
  section: { marginHorizontal: 20, marginBottom: 20, borderRadius: 20, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginLeft: 10 },
  infoItem: { marginBottom: 15 },
  infoLabel: { fontSize: 14, marginBottom: 5 },
  infoValue: { fontSize: 16, fontWeight: "500" },
  infoWithIcon: { flexDirection: "row", alignItems: "center", gap: 8 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, marginBottom: 8, fontWeight: "500" },
  input: { padding: 15, borderRadius: 12, borderWidth: 1, fontSize: 16 },
  errorText: { color: "#ff4757", fontSize: 12, marginTop: 5 },
  saveButton: { marginHorizontal: 20, marginBottom: 20, borderRadius: 15, overflow: "hidden", shadowColor: "#667eea", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonGradient: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16 },
  saveButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16, marginLeft: 8 },
  actionItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  actionLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  actionIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 16, marginLeft: 12, fontWeight: "500" },
});
