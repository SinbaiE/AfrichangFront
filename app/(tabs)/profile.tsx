"use client"

import { useState } from "react"
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
import { useEffect } from "react"

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
    email: user?.email || "",
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
        email: user.email || "",
        phone: user.phone || "",
        avatar: user.avatar || null,
      })
    }
  }, [user])

  // Validation en temps réel
  const validateField = (field: ValidationField, value: string): void => {
    const newErrors: ValidationErrors = { ...errors }

    switch (field) {
      case "name":
        if (!value.trim()) {
          newErrors.name = "Le nom est requis"
        } else if (value.length < 2) {
          newErrors.name = "Le nom doit contenir au moins 2 caractères"
        } else {
          delete newErrors.name
        }
        break
      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          newErrors.email = "Email invalide"
        } else {
          delete newErrors.email
        }
        break
      case "phone":
        const phoneRegex = /^\+[1-9]\d{1,14}$/
        if (!phoneRegex.test(value)) {
          newErrors.phone = "Numéro de téléphone invalide"
        } else {
          delete newErrors.phone
        }
        break
    }

    setErrors(newErrors)
  }

  const toggleEdit = () => {
    if (isEditing) {
      setShowConfirmModal(true)
    } else {
      setIsEditing(true)
      // Initialize form data with current user data
      if (user) {
        setTempData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phone: user.phone || "",
          avatar: user.avatar || null,
        })
      }
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }

  const handleSave = async () => {
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) {
      Alert.alert("Erreur", "Veuillez corriger les erreurs avant de sauvegarder");
      return;
    }

    setIsLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      await updateProfile(tempData); // Appel au service
      setIsEditing(false);

      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();

      Alert.alert("Succès", "Profil mis à jour avec succès!");
    } catch (error) {
      Alert.alert("Erreur", "Impossible de sauvegarder les modifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImagePicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission requise", "L'accès à la galerie est nécessaire.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      const uri = result.assets[0].uri;
      setIsLoading(true);
      try {
        await uploadAvatar(uri); // Appel au service
        Alert.alert("Succès", "Photo de profil mise à jour.");
      } catch (error) {
        Alert.alert("Erreur", "Impossible de mettre à jour la photo.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const cancelEdit = () => {
    setIsEditing(false)
    if (user) {
      setTempData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        avatar: user.avatar || null,
      })
    }
    setErrors({})
    setShowConfirmModal(false)

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start()
  }

  const themeColors: ThemeColors = {
    background: isDarkMode ? "#1a1a1a" : "#f8fafc",
    cardBackground: isDarkMode ? "#2d2d2d" : "#fff",
    text: isDarkMode ? "#fff" : "#1e293b",
    subText: isDarkMode ? "#a0a0a0" : "#64748b",
    border: isDarkMode ? "#404040" : "#e1e5e9",
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header avec gradient moderne */}
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
            {user?.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={12} color="#fff" />
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.name}>{tempData.firstName} {tempData.lastName}</Text>
          <Text style={styles.email}>{tempData.email}</Text>

          {/* Badges */}
          <View style={styles.badgesContainer}>
            <View style={styles.badge}>
              <Ionicons name="star" size={12} color="#ffd700" />
              <Text style={styles.badgeText}>Premium</Text>
            </View>
            <View style={styles.badge}>
              <Ionicons name="shield-checkmark" size={12} color="#4ade80" />
              <Text style={styles.badgeText}>Vérifié</Text>
            </View>
          </View>

          {/* Bouton d'édition */}
          <TouchableOpacity
            style={[styles.editButton, isLoading && styles.editButtonDisabled]}
            onPress={toggleEdit}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name={isEditing ? "close" : "create-outline"} size={20} color="#fff" />
            )}
            <Text style={styles.editButtonText}>
              {isLoading ? "Sauvegarde..." : isEditing ? "Annuler" : "Modifier"}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Stats rapides avec plus de détails */}
        <View style={[styles.statsContainer, { backgroundColor: themeColors.cardBackground }]}>
          <View style={styles.statItem}>
            <Ionicons name="wallet-outline" size={24} color="#667eea" />
            <Text style={[styles.statValue, { color: themeColors.text }]}>120,000</Text>
            <Text style={[styles.statLabel, { color: themeColors.subText }]}>FCFA</Text>
            <Text style={[styles.statChange, styles.statPositive]}>+12%</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: themeColors.border }]} />
          <View style={styles.statItem}>
            <Ionicons name="swap-horizontal-outline" size={24} color="#667eea" />
            <Text style={[styles.statValue, { color: themeColors.text }]}>47</Text>
            <Text style={[styles.statLabel, { color: themeColors.subText }]}>Échanges</Text>
            <Text style={[styles.statChange, styles.statPositive]}>+3</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: themeColors.border }]} />
          <View style={styles.statItem}>
            <Ionicons name="star-outline" size={24} color="#667eea" />
            <Text style={[styles.statValue, { color: themeColors.text }]}>4.8</Text>
            <Text style={[styles.statLabel, { color: themeColors.subText }]}>Note</Text>
            <Text style={[styles.statChange, styles.statNeutral]}>--</Text>
          </View>
        </View>

        {/* Informations du compte */}
        <View style={[styles.section, { backgroundColor: themeColors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color="#667eea" />
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Informations du compte</Text>
          </View>

          <View style={styles.accountInfo}>
            <View style={styles.accountInfoItem}>
              <Text style={[styles.accountInfoLabel, { color: themeColors.subText }]}>Membre depuis</Text>
              <Text style={[styles.accountInfoValue, { color: themeColors.text }]}>{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</Text>
            </View>
            <View style={styles.accountInfoItem}>
              <Text style={[styles.accountInfoLabel, { color: themeColors.subText }]}>Statut KYC</Text>
              <Text style={[styles.accountInfoValue, { color: themeColors.text }]}>{user?.kycStatus}</Text>
            </View>
          </View>
        </View>

        {/* Informations personnelles */}
        {!isEditing && (
          <View style={[styles.section, { backgroundColor: themeColors.cardBackground }]}>
            <View style={styles.sectionHeader}>
              <Ionicons name="person-outline" size={20} color="#667eea" />
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Informations personnelles</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: themeColors.subText }]}>Nom complet</Text>
              <Text style={[styles.infoValue, { color: themeColors.text }]}>{user?.firstName} {user?.lastName}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: themeColors.subText }]}>Email</Text>
              <View style={styles.infoWithIcon}>
                <Text style={[styles.infoValue, { color: themeColors.text }]}>{user?.email}</Text>
                {user?.isVerified && <Ionicons name="checkmark-circle" size={16} color="#4ade80" />}
              </View>
            </View>

            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: themeColors.subText }]}>Téléphone</Text>
              <Text style={[styles.infoValue, { color: themeColors.text }]}>{user?.phone}</Text>
            </View>
          </View>
        )}

        {/* Formulaire de modification avec validation */}
        {isEditing && (
          <Animated.View
            style={[
              styles.section,
              {
                backgroundColor: themeColors.cardBackground,
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="create-outline" size={20} color="#667eea" />
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Modifier les informations</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: themeColors.text }]}>Prénom</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.background,
                    borderColor: themeColors.border,
                    color: themeColors.text,
                  },
                ]}
                value={tempData.firstName}
                onChangeText={(value) => setTempData({ ...tempData, firstName: value })}
                placeholder="Entrez votre prénom"
                placeholderTextColor={themeColors.subText}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: themeColors.text }]}>Nom</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.background,
                    borderColor: themeColors.border,
                    color: themeColors.text,
                  },
                ]}
                value={tempData.lastName}
                onChangeText={(value) => setTempData({ ...tempData, lastName: value })}
                placeholder="Entrez votre nom"
                placeholderTextColor={themeColors.subText}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: themeColors.text }]}>Téléphone</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: themeColors.background,
                    borderColor: errors.phone ? "#ff4757" : themeColors.border,
                    color: themeColors.text,
                  },
                ]}
                value={tempData.phone}
                onChangeText={(value) => {
                  setTempData({ ...tempData, phone: value })
                  validateField("phone", value)
                }}
                placeholder="Entrez votre téléphone"
                placeholderTextColor={themeColors.subText}
                keyboardType="phone-pad"
              />
              {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
            </View>
          </Animated.View>
        )}

        {/* Préférences étendues */}
        <View style={[styles.section, { backgroundColor: themeColors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings-outline" size={20} color="#667eea" />
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Préférences</Text>
          </View>

          <TouchableOpacity style={styles.preferenceItem}>
            <View style={styles.preferenceLeft}>
              <Ionicons name="language-outline" size={20} color="#667eea" />
              <Text style={[styles.preferenceLabel, { color: themeColors.text }]}>Langue</Text>
            </View>
            <View style={styles.preferenceRight}>
              <Text style={[styles.preferenceValue, { color: themeColors.subText }]}>Français</Text>
              <Ionicons name="chevron-forward" size={16} color={themeColors.subText} />
            </View>
          </TouchableOpacity>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceLeft}>
              <Ionicons name="moon-outline" size={20} color="#667eea" />
              <Text style={[styles.preferenceLabel, { color: themeColors.text }]}>Mode sombre</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{ false: "#e1e5e9", true: "#667eea" }}
              thumbColor={isDarkMode ? "#fff" : "#f4f3f4"}
              ios_backgroundColor="#e1e5e9"
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceLeft}>
              <Ionicons name="notifications-outline" size={20} color="#667eea" />
              <Text style={[styles.preferenceLabel, { color: themeColors.text }]}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#e1e5e9", true: "#667eea" }}
              thumbColor={notificationsEnabled ? "#fff" : "#f4f3f4"}
              ios_backgroundColor="#e1e5e9"
            />
          </View>

          <View style={styles.preferenceItem}>
            <View style={styles.preferenceLeft}>
              <Ionicons name="finger-print-outline" size={20} color="#667eea" />
              <Text style={[styles.preferenceLabel, { color: themeColors.text }]}>Authentification biométrique</Text>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: "#e1e5e9", true: "#667eea" }}
              thumbColor={biometricEnabled ? "#fff" : "#f4f3f4"}
              ios_backgroundColor="#e1e5e9"
            />
          </View>
        </View>

        {/* Sécurité */}
        <View style={[styles.section, { backgroundColor: themeColors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-outline" size={20} color="#667eea" />
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Sécurité</Text>
          </View>

          <TouchableOpacity style={styles.actionItem} onPress={() => setShowSecurityModal(true)}>
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: "#e8f2ff" }]}>
                <Ionicons name="key-outline" size={20} color="#667eea" />
              </View>
              <Text style={[styles.actionLabel, { color: themeColors.text }]}>Changer le mot de passe</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={themeColors.subText} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: "#fff2e8" }]}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={"#ff9500"}
                />
              </View>
              <View>
                <Text style={[styles.actionLabel, { color: themeColors.text }]}>Authentification à deux facteurs</Text>
                <Text style={[styles.actionSubLabel, { color: themeColors.subText }]}>
                  Désactivée
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={themeColors.subText} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: "#e8f2ff" }]}>
                <Ionicons name="phone-portrait-outline" size={20} color="#667eea" />
              </View>
              <Text style={[styles.actionLabel, { color: themeColors.text }]}>Appareils connectés</Text>
            </View>
            <View style={styles.actionRight}>
              <Text style={[styles.actionValue, { color: themeColors.subText }]}>3 appareils</Text>
              <Ionicons name="chevron-forward" size={20} color={themeColors.subText} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Bouton de sauvegarde */}
        {isEditing && (
          <Animated.View style={{ opacity: fadeAnim }}>
            <TouchableOpacity
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
              onPress={handleSave}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isDarkMode ? ["#4c1d95", "#7c3aed"] : ["#667eea", "#764ba2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButtonGradient}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="checkmark-outline" size={20} color="#fff" />
                )}
                <Text style={styles.saveButtonText}>
                  {isLoading ? "Sauvegarde en cours..." : "Enregistrer les modifications"}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Actions rapides étendues */}
        <View style={[styles.section, { backgroundColor: themeColors.cardBackground }]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="flash-outline" size={20} color="#667eea" />
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Actions rapides</Text>
          </View>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: "#e8f2ff" }]}>
                <Ionicons name="document-text-outline" size={20} color="#667eea" />
              </View>
              <Text style={[styles.actionLabel, { color: themeColors.text }]}>Exporter mes données</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={themeColors.subText} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: "#fff2e8" }]}>
                <Ionicons name="help-circle-outline" size={20} color="#ff9500" />
              </View>
              <Text style={[styles.actionLabel, { color: themeColors.text }]}>Centre d'aide</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={themeColors.subText} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: "#f0e8ff" }]}>
                <Ionicons name="chatbubble-outline" size={20} color="#8b5cf6" />
              </View>
              <Text style={[styles.actionLabel, { color: themeColors.text }]}>Contacter le support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={themeColors.subText} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem} onPress={logout}>
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: "#ffe8e8" }]}>
                <Ionicons name="log-out-outline" size={20} color="#ff4757" />
              </View>
              <Text style={[styles.actionLabel, { color: "#ff4757" }]}>Se déconnecter</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={themeColors.subText} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Modal de confirmation */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showConfirmModal}
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themeColors.cardBackground }]}>
            <Ionicons name="warning-outline" size={48} color="#ff9500" />
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>Annuler les modifications ?</Text>
            <Text style={[styles.modalText, { color: themeColors.subText }]}>
              Toutes les modifications non sauvegardées seront perdues.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Continuer l'édition</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.modalButtonPrimary]} onPress={cancelEdit}>
                <Text style={styles.modalButtonTextPrimary}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de sécurité */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showSecurityModal}
        onRequestClose={() => setShowSecurityModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.securityModalContent, { backgroundColor: themeColors.cardBackground }]}>
            <View style={styles.securityModalHeader}>
              <Text style={[styles.securityModalTitle, { color: themeColors.text }]}>Changer le mot de passe</Text>
              <TouchableOpacity onPress={() => setShowSecurityModal(false)}>
                <Ionicons name="close" size={24} color={themeColors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.securityForm}>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: themeColors.text }]}>Mot de passe actuel</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                      color: themeColors.text,
                    },
                  ]}
                  placeholder="Entrez votre mot de passe actuel"
                  placeholderTextColor={themeColors.subText}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: themeColors.text }]}>Nouveau mot de passe</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                      color: themeColors.text,
                    },
                  ]}
                  placeholder="Entrez votre nouveau mot de passe"
                  placeholderTextColor={themeColors.subText}
                  secureTextEntry
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: themeColors.text }]}>Confirmer le nouveau mot de passe</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: themeColors.background,
                      borderColor: themeColors.border,
                      color: themeColors.text,
                    },
                  ]}
                  placeholder="Confirmez votre nouveau mot de passe"
                  placeholderTextColor={themeColors.subText}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity style={styles.securitySaveButton}>
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.securitySaveButtonGradient}
              >
                <Text style={styles.securitySaveButtonText}>Changer le mot de passe</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 15,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.3)",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 40,
  },
  cameraOverlay: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#4ade80",
    borderWidth: 2,
    borderColor: "#fff",
  },
  verifiedBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4ade80",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 15,
  },
  badgesContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginHorizontal: 5,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  editButtonDisabled: {
    opacity: 0.6,
  },
  editButtonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    paddingVertical: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    marginVertical: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  statChange: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
  },
  statPositive: {
    color: "#4ade80",
  },
  statNeutral: {
    color: "#64748b",
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  accountInfo: {
    gap: 15,
  },
  accountInfoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  accountInfoLabel: {
    fontSize: 14,
  },
  accountInfoValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  infoItem: {
    marginBottom: 15,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  infoWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  errorText: {
    color: "#ff4757",
    fontSize: 12,
    marginTop: 5,
  },
  preferenceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  preferenceLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  preferenceRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  preferenceLabel: {
    fontSize: 16,
    marginLeft: 12,
  },
  preferenceValue: {
    fontSize: 16,
  },
  saveButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  actionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  actionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: "500",
  },
  actionSubLabel: {
    fontSize: 12,
    marginLeft: 12,
    marginTop: 2,
  },
  actionValue: {
    fontSize: 14,
  },
  bottomSpacer: {
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width - 40,
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 15,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modalButtonPrimary: {
    backgroundColor: "#ff4757",
  },
  modalButtonSecondary: {
    backgroundColor: "#e1e5e9",
  },
  modalButtonTextPrimary: {
    color: "#fff",
    fontWeight: "600",
  },
  modalButtonTextSecondary: {
    color: "#64748b",
    fontWeight: "600",
  },
  securityModalContent: {
    width: width - 20,
    maxHeight: "80%",
    borderRadius: 20,
    padding: 0,
    overflow: "hidden",
  },
  securityModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  securityModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  securityForm: {
    padding: 20,
  },
  securitySaveButton: {
    margin: 20,
    borderRadius: 15,
    overflow: "hidden",
  },
  securitySaveButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  securitySaveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
})
