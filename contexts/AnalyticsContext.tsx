"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import * as SecureStore from "expo-secure-store"
import { useAuth } from "./AuthContext"

interface AnalyticsEvent {
  id: string
  event: string
  properties: Record<string, any>
  timestamp: number
  userId?: string
  sessionId: string
  platform: "mobile" | "web"
  version: string
}

interface UserMetrics {
  totalSessions: number
  totalEvents: number
  lastActiveAt: number
  firstSeenAt: number
  totalTransactionValue: number
  averageSessionDuration: number
  favoriteFeatures: string[]
}

interface AnalyticsContextType {
  track: (event: string, properties?: Record<string, any>) => void
  identify: (userId: string, traits?: Record<string, any>) => void
  screen: (screenName: string, properties?: Record<string, any>) => void
  startSession: () => void
  endSession: () => void
  getUserMetrics: () => UserMetrics | null
  getEvents: (limit?: number) => AnalyticsEvent[]
  exportData: () => Promise<string>
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [sessionId, setSessionId] = useState<string>("")
  const [sessionStartTime, setSessionStartTime] = useState<number>(0)
  const [userMetrics, setUserMetrics] = useState<UserMetrics | null>(null)

  useEffect(() => {
    initializeAnalytics()
    startSession()
  }, [])

  useEffect(() => {
    if (user) {
      identify(user.id, {
        email: user.email,
        country: user.country,
        isVerified: user.isVerified,
        kycStatus: user.kycStatus,
      })
    }
  }, [user])

  const initializeAnalytics = async () => {
    try {
      // Charger les événements stockés
      const storedEvents = await SecureStore.getItemAsync("analytics_events")
      if (storedEvents) {
        setEvents(JSON.parse(storedEvents))
      }

      // Charger les métriques utilisateur
      const storedMetrics = await SecureStore.getItemAsync("user_metrics")
      if (storedMetrics) {
        setUserMetrics(JSON.parse(storedMetrics))
      }
    } catch (error) {
      console.error("Erreur initialisation analytics:", error)
    }
  }

  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const startSession = () => {
    const newSessionId = generateSessionId()
    setSessionId(newSessionId)
    setSessionStartTime(Date.now())

    track("session_start", {
      sessionId: newSessionId,
      timestamp: Date.now(),
    })

    // Mettre à jour les métriques
    updateUserMetrics("session_start")
  }

  const endSession = () => {
    const sessionDuration = Date.now() - sessionStartTime

    track("session_end", {
      sessionId,
      duration: sessionDuration,
      timestamp: Date.now(),
    })

    updateUserMetrics("session_end", { duration: sessionDuration })
  }

  const track = (event: string, properties: Record<string, any> = {}) => {
    const analyticsEvent: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      event,
      properties: {
        ...properties,
        url: properties.screen || "unknown",
        userAgent: "AfriChange Mobile App",
      },
      timestamp: Date.now(),
      userId: user?.id,
      sessionId,
      platform: "mobile",
      version: "1.0.0",
    }

    setEvents((prev) => {
      const newEvents = [analyticsEvent, ...prev].slice(0, 1000) // Garder seulement les 1000 derniers
      saveEventsToStorage(newEvents)
      return newEvents
    })

    // Envoyer au serveur en arrière-plan
    sendToServer(analyticsEvent)

    // Mettre à jour les métriques
    updateUserMetrics("event", { event, properties })
  }

  const identify = (userId: string, traits: Record<string, any> = {}) => {
    track("user_identify", {
      userId,
      traits,
    })
  }

  const screen = (screenName: string, properties: Record<string, any> = {}) => {
    track("screen_view", {
      screen: screenName,
      ...properties,
    })
  }

  const updateUserMetrics = (type: string, data?: any) => {
    setUserMetrics((prev) => {
      const now = Date.now()
      const updated: UserMetrics = prev || {
        totalSessions: 0,
        totalEvents: 0,
        lastActiveAt: now,
        firstSeenAt: now,
        totalTransactionValue: 0,
        averageSessionDuration: 0,
        favoriteFeatures: [],
      }

      switch (type) {
        case "session_start":
          updated.totalSessions += 1
          updated.lastActiveAt = now
          if (!prev) updated.firstSeenAt = now
          break

        case "session_end":
          if (data?.duration) {
            updated.averageSessionDuration =
              (updated.averageSessionDuration * (updated.totalSessions - 1) + data.duration) / updated.totalSessions
          }
          break

        case "event":
          updated.totalEvents += 1
          updated.lastActiveAt = now

          // Tracker les fonctionnalités favorites
          if (data?.event && data.event.includes("_")) {
            const feature = data.event.split("_")[0]
            const featureIndex = updated.favoriteFeatures.findIndex((f) => f === feature)
            if (featureIndex >= 0) {
              // Déplacer vers le haut
              updated.favoriteFeatures.splice(featureIndex, 1)
              updated.favoriteFeatures.unshift(feature)
            } else {
              updated.favoriteFeatures.unshift(feature)
              updated.favoriteFeatures = updated.favoriteFeatures.slice(0, 5) // Top 5
            }
          }

          // Tracker la valeur des transactions
          if (data?.properties?.amount && data?.event.includes("transaction")) {
            updated.totalTransactionValue += data.properties.amount
          }
          break
      }

      saveMetricsToStorage(updated)
      return updated
    })
  }

  const saveEventsToStorage = async (eventsToSave: AnalyticsEvent[]) => {
    try {
      await SecureStore.setItemAsync("analytics_events", JSON.stringify(eventsToSave))
    } catch (error) {
      console.error("Erreur sauvegarde événements:", error)
    }
  }

  const saveMetricsToStorage = async (metrics: UserMetrics) => {
    try {
      await SecureStore.setItemAsync("user_metrics", JSON.stringify(metrics))
    } catch (error) {
      console.error("Erreur sauvegarde métriques:", error)
    }
  }

  const sendToServer = async (event: AnalyticsEvent) => {
    try {
      // Envoyer en arrière-plan sans bloquer l'UI
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      }).catch(() => {
        // Ignorer les erreurs réseau pour ne pas impacter l'UX
      })
    } catch (error) {
      // Ignorer silencieusement
    }
  }

  const getUserMetrics = () => userMetrics

  const getEvents = (limit = 100) => {
    return events.slice(0, limit)
  }

  const exportData = async (): Promise<string> => {
    const data = {
      events: events,
      metrics: userMetrics,
      exportedAt: new Date().toISOString(),
      userId: user?.id,
    }
    return JSON.stringify(data, null, 2)
  }

  return (
    <AnalyticsContext.Provider
      value={{
        track,
        identify,
        screen,
        startSession,
        endSession,
        getUserMetrics,
        getEvents,
        exportData,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  )
}

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext)
  if (!context) {
    throw new Error("useAnalytics must be used within AnalyticsProvider")
  }
  return context
}
