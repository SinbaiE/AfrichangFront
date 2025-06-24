"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import NetInfo from "@react-native-community/netinfo"
import * as SecureStore from "expo-secure-store"

interface OfflineAction {
  id: string
  type: "exchange" | "transaction" | "kyc_update" | "profile_update"
  data: any
  timestamp: number
  retryCount: number
}

interface OfflineContextType {
  isOnline: boolean
  isConnected: boolean
  pendingActions: OfflineAction[]
  queueAction: (type: string, data: any) => void
  syncPendingActions: () => Promise<void>
  getCachedData: (key: string) => Promise<any>
  setCachedData: (key: string, data: any) => Promise<void>
  getOfflineCapabilities: () => string[]
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined)

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true)
  const [isConnected, setIsConnected] = useState(true)
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([])

  useEffect(() => {
    const unsubscribe = setupNetworkListener()
    loadPendingActions()
    return () => unsubscribe?.()
  }, [])

  useEffect(() => {
    if (isOnline && pendingActions.length > 0) {
      syncPendingActions()
    }
  }, [isOnline])

  const setupNetworkListener = () => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = state.isConnected && state.isInternetReachable
      setIsOnline(online ?? false)
      setIsConnected(state.isConnected ?? false)
    })

    // Vérification initiale
    NetInfo.fetch().then((state) => {
      const online = state.isConnected && state.isInternetReachable
      setIsOnline(online ?? false)
      setIsConnected(state.isConnected ?? false)
    })

    return unsubscribe
  }

  const loadPendingActions = async () => {
    try {
      const stored = await SecureStore.getItemAsync("offline_pending_actions")
      if (stored) {
        setPendingActions(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Erreur chargement actions en attente:", error)
    }
  }

  const savePendingActions = async (actions: OfflineAction[]) => {
    try {
      await SecureStore.setItemAsync("offline_pending_actions", JSON.stringify(actions))
    } catch (error) {
      console.error("Erreur sauvegarde actions en attente:", error)
    }
  }

  const queueAction = (type: string, data: any) => {
    const action: OfflineAction = {
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type as any,
      data,
      timestamp: Date.now(),
      retryCount: 0,
    }

    const newActions = [...pendingActions, action]
    setPendingActions(newActions)
    savePendingActions(newActions)

    if (isOnline) {
      syncPendingActions()
    }
  }

  const syncPendingActions = async () => {
    if (!isOnline || pendingActions.length === 0) return

    const actionsToSync = [...pendingActions]
    const successfulActions: string[] = []

    for (const action of actionsToSync) {
      try {
        await executeAction(action)
        successfulActions.push(action.id)
      } catch (error) {
        console.error(`Erreur sync action ${action.id}:`, error)
        action.retryCount += 1

        if (action.retryCount >= 3) {
          successfulActions.push(action.id)
          console.warn(`Action ${action.id} supprimée après 3 tentatives`)
        }
      }
    }

    const remainingActions = pendingActions.filter((action) => !successfulActions.includes(action.id))
    setPendingActions(remainingActions)
    savePendingActions(remainingActions)
  }

  const executeAction = async (action: OfflineAction) => {
    const urlMap: Record<string, { method: string; url: string }> = {
      exchange: { method: "POST", url: "/api/exchange/execute" },
      transaction: { method: "POST", url: "/api/transactions" },
      kyc_update: { method: "PUT", url: "/api/kyc/update" },
      profile_update: { method: "PUT", url: "/api/user/profile" },
    }

    const config = urlMap[action.type]
    if (!config) throw new Error(`Type d'action non supporté: ${action.type}`)

    await fetch(config.url, {
      method: config.method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(action.data),
    })
  }

  const getCachedData = async (key: string): Promise<any> => {
    try {
      const cached = await SecureStore.getItemAsync(`cache_${key}`)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error(`Erreur lecture cache ${key}:`, error)
      return null
    }
  }

  const setCachedData = async (key: string, data: any) => {
    try {
      await SecureStore.setItemAsync(`cache_${key}`, JSON.stringify(data))
    } catch (error) {
      console.error(`Erreur écriture cache ${key}:`, error)
    }
  }

  const getOfflineCapabilities = (): string[] => {
    return [
      "Consultation du solde (données mises en cache)",
      "Historique des transactions (cache local)",
      "Paramètres de profil (lecture seule)",
      "Données KYC (consultation)",
      "Préparation d'échanges (exécution différée)",
      "Analytics (stockage local)",
      "Notifications (affichage)",
    ]
  }

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isConnected,
        pendingActions,
        queueAction,
        syncPendingActions,
        getCachedData,
        setCachedData,
        getOfflineCapabilities,
      }}
    >
      {children}
    </OfflineContext.Provider>
  )
}

export const useOffline = () => {
  const context = useContext(OfflineContext)
  if (!context) {
    throw new Error("useOffline must be used within OfflineProvider")
  }
  return context
}
