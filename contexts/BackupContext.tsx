"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import * as SecureStore from "expo-secure-store"
import * as FileSystem from "expo-file-system"
import { useAuth } from "./AuthContext"

interface BackupData {
  user: any
  wallets: any[]
  transactions: any[]
  kycData: any
  settings: any
  analytics: any
  timestamp: number
  version: string
}

interface BackupContextType {
  isBackingUp: boolean
  lastBackupTime: number | null
  autoBackupEnabled: boolean
  createBackup: () => Promise<string>
  restoreBackup: (backupData: string) => Promise<void>
  scheduleAutoBackup: (enabled: boolean) => void
  getBackupSize: () => Promise<number>
  exportBackup: () => Promise<string>
  importBackup: (filePath: string) => Promise<void>
}

const BackupContext = createContext<BackupContextType | undefined>(undefined)

export function BackupProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [lastBackupTime, setLastBackupTime] = useState<number | null>(null)
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true)

  useEffect(() => {
    loadBackupSettings()
    if (autoBackupEnabled) {
      schedulePeriodicBackup()
    }
  }, [autoBackupEnabled])

  const loadBackupSettings = async () => {
    try {
      const settings = await SecureStore.getItemAsync("backup_settings")
      if (settings) {
        const parsed = JSON.parse(settings)
        setAutoBackupEnabled(parsed.autoBackupEnabled ?? true)
        setLastBackupTime(parsed.lastBackupTime)
      }
    } catch (error) {
      console.error("Erreur chargement paramètres backup:", error)
    }
  }

  const saveBackupSettings = async (settings: any) => {
    try {
      await SecureStore.setItemAsync("backup_settings", JSON.stringify(settings))
    } catch (error) {
      console.error("Erreur sauvegarde paramètres backup:", error)
    }
  }

  const schedulePeriodicBackup = () => {
    // Backup automatique toutes les 24h
    const interval = setInterval(
      async () => {
        if (autoBackupEnabled && user) {
          await createBackup()
        }
      },
      24 * 60 * 60 * 1000,
    ) // 24 heures

    return () => clearInterval(interval)
  }

  const collectBackupData = async (): Promise<BackupData> => {
    try {
      // Collecter toutes les données utilisateur
      const [userDataStr, walletsStr, transactionsStr, kycDataStr, settingsStr, analyticsStr] = await Promise.all([
        SecureStore.getItemAsync("user_data"),
        SecureStore.getItemAsync("wallets_data"),
        SecureStore.getItemAsync("transactions_cache"),
        SecureStore.getItemAsync("kyc_data"),
        SecureStore.getItemAsync("app_settings"),
        SecureStore.getItemAsync("analytics_events"),
      ])

      return {
        user: userDataStr ? JSON.parse(userDataStr) : user,
        wallets: walletsStr ? JSON.parse(walletsStr) : [],
        transactions: transactionsStr ? JSON.parse(transactionsStr) : [],
        kycData: kycDataStr ? JSON.parse(kycDataStr) : null,
        settings: settingsStr ? JSON.parse(settingsStr) : {},
        analytics: analyticsStr ? JSON.parse(analyticsStr) : [],
        timestamp: Date.now(),
        version: "1.0.0",
      }
    } catch (error) {
      console.error("Erreur collecte données backup:", error)
      throw error
    }
  }

  const createBackup = async (): Promise<string> => {
    setIsBackingUp(true)
    try {
      const backupData = await collectBackupData()
      const backupString = JSON.stringify(backupData)

      // Sauvegarder localement
      const backupPath = `${FileSystem.documentDirectory}backup_${Date.now()}.json`
      await FileSystem.writeAsStringAsync(backupPath, backupString)

      // Sauvegarder dans SecureStore (backup principal)
      await SecureStore.setItemAsync("latest_backup", backupString)

      // Envoyer au serveur (backup cloud)
      try {
        await fetch("/api/backup/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.id,
            data: backupString,
            timestamp: Date.now(),
          }),
        })
      } catch (cloudError) {
        console.warn("Backup cloud échoué, backup local créé:", cloudError)
      }

      const now = Date.now()
      setLastBackupTime(now)
      await saveBackupSettings({ autoBackupEnabled, lastBackupTime: now })

      return backupPath
    } catch (error) {
      console.error("Erreur création backup:", error)
      throw error
    } finally {
      setIsBackingUp(false)
    }
  }

  const restoreBackup = async (backupData: string) => {
    try {
      const parsed: BackupData = JSON.parse(backupData)

      // Vérifier la version de compatibilité
      if (parsed.version !== "1.0.0") {
        throw new Error("Version de backup incompatible")
      }

      // Restaurer les données
      const restorePromises = []

      if (parsed.user) {
        restorePromises.push(SecureStore.setItemAsync("user_data", JSON.stringify(parsed.user)))
      }

      if (parsed.wallets) {
        restorePromises.push(SecureStore.setItemAsync("wallets_data", JSON.stringify(parsed.wallets)))
      }

      if (parsed.transactions) {
        restorePromises.push(SecureStore.setItemAsync("transactions_cache", JSON.stringify(parsed.transactions)))
      }

      if (parsed.kycData) {
        restorePromises.push(SecureStore.setItemAsync("kyc_data", JSON.stringify(parsed.kycData)))
      }

      if (parsed.settings) {
        restorePromises.push(SecureStore.setItemAsync("app_settings", JSON.stringify(parsed.settings)))
      }

      if (parsed.analytics) {
        restorePromises.push(SecureStore.setItemAsync("analytics_events", JSON.stringify(parsed.analytics)))
      }

      await Promise.all(restorePromises)

      console.log("Backup restauré avec succès")
    } catch (error) {
      console.error("Erreur restauration backup:", error)
      throw error
    }
  }

  const scheduleAutoBackup = (enabled: boolean) => {
    setAutoBackupEnabled(enabled)
    saveBackupSettings({ autoBackupEnabled: enabled, lastBackupTime })
  }

  const getBackupSize = async (): Promise<number> => {
    try {
      const backupData = await collectBackupData()
      const backupString = JSON.stringify(backupData)
      return new Blob([backupString]).size
    } catch (error) {
      return 0
    }
  }

  const exportBackup = async (): Promise<string> => {
    const backupPath = await createBackup()
    return backupPath
  }

  const importBackup = async (filePath: string) => {
    try {
      const backupContent = await FileSystem.readAsStringAsync(filePath)
      await restoreBackup(backupContent)
    } catch (error) {
      console.error("Erreur import backup:", error)
      throw error
    }
  }

  return (
    <BackupContext.Provider
      value={{
        isBackingUp,
        lastBackupTime,
        autoBackupEnabled,
        createBackup,
        restoreBackup,
        scheduleAutoBackup,
        getBackupSize,
        exportBackup,
        importBackup,
      }}
    >
      {children}
    </BackupContext.Provider>
  )
}

export const useBackup = () => {
  const context = useContext(BackupContext)
  if (!context) {
    throw new Error("useBackup must be used within BackupProvider")
  }
  return context
}
