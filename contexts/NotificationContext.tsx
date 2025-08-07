"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import * as Notifications from "expo-notifications"
import * as Device from "expo-device"
import { NotificationService } from "@/services/NotificationService"

interface NotificationData {
  id: string
  title: string
  body: string
  data?: any
  timestamp: number
  read: boolean
  type: "kyc" | "transaction" | "exchange" | "security" | "general"
  priority: "low" | "normal" | "high"
}

interface NotificationContextType {
  notifications: NotificationData[]
  unreadCount: number
  isLoading: boolean
  registerForPushNotifications: () => Promise<string | null>
  sendLocalNotification: (title: string, body: string, data?: any) => Promise<void>
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  deleteNotification: (notificationId: string) => void
  clearAllNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // useEffect(() => {
  //   loadNotifications()
  //   setupNotificationListeners()
  // }, [])

  const loadNotifications = async () => {
    setIsLoading(true)
    try {
      const data = await NotificationService.getNotifications()
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error("Erreur chargement notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const setupNotificationListeners = () => {
    // Écouter les notifications reçues
    const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
      const newNotification: NotificationData = {
        id: notification.request.identifier,
        title: notification.request.content.title || "",
        body: notification.request.content.body || "",
        data: notification.request.content.data,
        timestamp: Date.now(),
        read: false,
        type: notification.request.content.data?.type || "general",
        priority: notification.request.content.data?.priority || "normal",
      }

      setNotifications((prev) => [newNotification, ...prev])
    })

    // Écouter les interactions avec les notifications
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const notificationId = response.notification.request.identifier
      markAsRead(notificationId)

      // Navigation basée sur le type de notification
      const notificationType = response.notification.request.content.data?.type
      handleNotificationNavigation(notificationType, response.notification.request.content.data)
    })

    return () => {
      receivedSubscription.remove()
      responseSubscription.remove()
    }
  }

  const handleNotificationNavigation = (type: string, data: any) => {
    // Navigation automatique basée sur le type de notification
    switch (type) {
      case "kyc":
        // Naviguer vers le statut KYC
        break
      case "transaction":
        // Naviguer vers l'historique des transactions
        break
      case "exchange":
        // Naviguer vers l'écran d'échange
        break
      default:
        break
    }
  }

  const registerForPushNotifications = async (): Promise<string | null> => {
    if (!Device.isDevice) {
      alert("Les notifications push ne fonctionnent que sur un appareil physique")
      return null
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== "granted") {
      alert("Permission de notification refusée")
      return null
    }

    try {
      const expoPushToken = await Notifications.getExpoPushTokenAsync({
        projectId: "your-expo-project-id", // Remplacer par votre project ID
      })

      if (expoPushToken.data) {
        await NotificationService.registerPushToken(expoPushToken.data)
      }

      return expoPushToken.data
    } catch (error) {
      console.error("Erreur enregistrement push token:", error)
      return null
    }
  }

  const sendLocalNotification = async (title: string, body: string, data?: any) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: null, // Immédiatement
    })
  }

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === notificationId ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId))
  }

  const clearAllNotifications = () => {
    setNotifications([])
  }

  const unreadCount = notifications.filter((notif) => !notif.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        registerForPushNotifications,
        sendLocalNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider")
  }
  return context
}
