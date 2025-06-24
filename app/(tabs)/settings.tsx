"use client"

import { useState } from "react"
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Switch, Alert } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useBackup } from "@contexts/BackupContext"
import { useOffline } from "@contexts/OfflineContext"
import { useNotifications } from "@contexts/NotificationContext"

export default function SettingsScreen() {
  const { createBackup, isBackingUp, lastBackupTime, autoBackupEnabled, scheduleAutoBackup } = useBackup()
  const { isOnline, pendingActions, getOfflineCapabilities } = useOffline()
  const { registerForPushNotifications } = useNotifications()

  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [biometricEnabled, setBiometricEnabled] = useState(false)
  const [darkModeEnabled, setDarkModeEnabled] = useState(false)

  const handleManualBackup = async () => {
    try {
      Alert.alert("Création du backup", "Création d'une sauvegarde en cours...")
      await createBackup()
      Alert.alert("Succès", "Sauvegarde créée avec succès")
    } catch (error) {
      Alert.alert("Erreur", "Impossible de créer la sauvegarde")
    }
  }

  const handleNotificationToggle = async (enabled: boolean) => {
    setNotificationsEnabled(enabled)
    if (enabled) {
      await registerForPushNotifications()
    }
  }

  const formatLastBackup = () => {
    if (!lastBackupTime) return "Jamais"
    const date = new Date(lastBackupTime)
    return date.toLocaleString()
  }

  const settingSections = [
    {
      title: "Sécurité",
      items: [
        {
          icon: "shield-checkmark-outline",
          title: "Authentification biométrique",
          subtitle: "Utiliser l'empreinte ou Face ID",
          type: "switch",
          value: biometricEnabled,
          onToggle: setBiometricEnabled,
        },
        {
          icon: "lock-closed-outline",
          title: "Changer le mot de passe",
          subtitle: "Modifier votre mot de passe",
          type: "navigation",
          onPress: () => console.log("Change password"),
        },
        {
          icon: "key-outline",
          title: "Authentification à deux facteurs",
          subtitle: "Sécurité renforcée",
          type: "navigation",
          onPress: () => console.log("2FA"),
        },
      ],
    },
    {
      title: "Notifications",
      items: [
        {
          icon: "notifications-outline",
          title: "Notifications push",
          subtitle: "Recevoir les alertes importantes",
          type: "switch",
          value: notificationsEnabled,
          onToggle: handleNotificationToggle,
        },
        {
          icon: "mail-outline",
          title: "Notifications email",
          subtitle: "Alertes par email",
          type: "navigation",
          onPress: () => console.log("Email notifications"),
        },
      ],
    },
    {
      title: "Sauvegarde et synchronisation",
      items: [
        {
          icon: "cloud-upload-outline",
          title: "Sauvegarde automatique",
          subtitle: "Backup quotidien automatique",
          type: "switch",
          value: autoBackupEnabled,
          onToggle: scheduleAutoBackup,
        },
        {
          icon: "download-outline",
          title: "Créer une sauvegarde",
          subtitle: `Dernière: ${formatLastBackup()}`,
          type: "action",
          onPress: handleManualBackup,
          loading: isBackingUp,
        },
        {
          icon: "sync-outline",
          title: "Synchronisation",
          subtitle: `${pendingActions.length} actions en attente`,
          type: "navigation",
          onPress: () => console.log("Sync settings"),
        },
      ],
    },
    {
      title: "Mode hors-ligne",
      items: [
        {
          icon: isOnline ? "wifi-outline" : "wifi-off-outline",
          title: "Statut de connexion",
          subtitle: isOnline ? "En ligne" : "Hors ligne",
          type: "status",
          status: isOnline ? "online" : "offline",
        },
        {
          icon: "list-outline",
          title: "Fonctionnalités hors-ligne",
          subtitle: "Voir les capacités disponibles",
          type: "navigation",
          onPress: () => {
            const capabilities = getOfflineCapabilities()
            Alert.alert("Mode hors-ligne", capabilities.join("\n\n"))
          },
        },
      ],
    },
    {
      title: "Préférences",
      items: [
        {
          icon: "moon-outline",
          title: "Mode sombre",
          subtitle: "Interface sombre",
          type: "switch",
          value: darkModeEnabled,
          onToggle: setDarkModeEnabled,
        },
        {
          icon: "language-outline",
          title: "Langue",
          subtitle: "Français",
          type: "navigation",
          onPress: () => console.log("Language"),
        },
        {
          icon: "location-outline",
          title: "Devise par défaut",
          subtitle: "FCFA (XOF)",
          type: "navigation",
          onPress: () => console.log("Default currency"),
        },
      ],
    },
    {
      title: "Support",
      items: [
        {
          icon: "help-circle-outline",
          title: "Centre d'aide",
          subtitle: "FAQ et guides",
          type: "navigation",
          onPress: () => console.log("Help center"),
        },
        {
          icon: "chatbubble-outline",
          title: "Contacter le support",
          subtitle: "Assistance 24/7",
          type: "navigation",
          onPress: () => console.log("Contact support"),
        },
        {
          icon: "document-text-outline",
          title: "Conditions d'utilisation",
          subtitle: "Termes et conditions",
          type: "navigation",
          onPress: () => console.log("Terms"),
        },
      ],
    },
  ]

  const renderSettingItem = (item: any) => {
    return (
      <TouchableOpacity
        key={item.title}
        style={styles.settingItem}
        onPress={item.onPress}
        disabled={item.type === "switch" || item.type === "status"}
      >
        <View style={styles.settingIcon}>
          <Ionicons name={item.icon} size={20} color="#667eea" />
        </View>

        <View style={styles.settingContent}>
          <Text style={styles.settingTitle}>{item.title}</Text>
          <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
        </View>

        <View style={styles.settingAction}>
          {item.type === "switch" && (
            <Switch
              value={item.value}
              onValueChange={item.onToggle}
              trackColor={{ false: "#e1e5e9", true: "#667eea" }}
              thumbColor="#fff"
            />
          )}

          {item.type === "navigation" && <Ionicons name="chevron-forward" size={16} color="#94a3b8" />}

          {item.type === "action" && item.loading && (
            <View style={styles.loadingIndicator}>
              <Text style={styles.loadingText}>...</Text>
            </View>
          )}

          {item.type === "status" && (
            <View style={[styles.statusDot, { backgroundColor: item.status === "online" ? "#10b981" : "#ef4444" }]} />
          )}
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
          <Text style={styles.headerTitle}>Paramètres</Text>
          <Text style={styles.headerSubtitle}>Personnalisez votre expérience</Text>
        </LinearGradient>

        {/* Settings Sections */}
        {settingSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>{section.items.map(renderSettingItem)}</View>
          </View>
        ))}

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoTitle}>AfriChange</Text>
          <Text style={styles.appInfoVersion}>Version 1.0.0</Text>
          <Text style={styles.appInfoCopyright}>© 2024 AfriChange. Tous droits réservés.</Text>
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
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
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
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 5,
  },
  settingSubtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  settingAction: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingIndicator: {
    width: 30,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#667eea",
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  appInfo: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  appInfoTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 5,
  },
  appInfoVersion: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 10,
  },
  appInfoCopyright: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
  },
})
