"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import * as Location from "expo-location"

interface LocationData {
  latitude: number
  longitude: number
  country: string
  city: string
  region: string
  countryCode: string
  timestamp: number
}

interface LocationContextType {
  location: LocationData | null
  isLoading: boolean
  error: string | null
  requestLocation: () => Promise<void>
  verifyLocation: (expectedCountry: string) => boolean
  getLocationString: () => string
}

const LocationContext = createContext<LocationContextType | undefined>(undefined)

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    requestLocation()
  }, [])

  const requestLocation = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Demander les permissions
      const { status } = await Location.requestForegroundPermissionsAsync()
      if (status !== "granted") {
        setError("Permission de géolocalisation refusée")
        return
      }

      // Obtenir la position actuelle
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      })

      // Géocodage inverse pour obtenir l'adresse
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0]
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          country: address.country || "Inconnu",
          city: address.city || "Inconnu",
          region: address.region || "Inconnu",
          countryCode: address.isoCountryCode || "XX",
          timestamp: Date.now(),
        }

        setLocation(locationData)

        // Sauvegarder pour vérification KYC
        await saveLocationForKYC(locationData)
      }
    } catch (err: any) {
      setError(err.message || "Erreur de géolocalisation")
    } finally {
      setIsLoading(false)
    }
  }

  const saveLocationForKYC = async (locationData: LocationData) => {
    try {
      // Envoyer au serveur pour vérification
      const response = await fetch("/api/kyc/location", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(locationData),
      })
    } catch (error) {
      console.error("Erreur sauvegarde localisation:", error)
    }
  }

  const verifyLocation = (expectedCountry: string): boolean => {
    if (!location) return false
    return location.countryCode.toLowerCase() === expectedCountry.toLowerCase()
  }

  const getLocationString = (): string => {
    if (!location) return "Localisation inconnue"
    return `${location.city}, ${location.country}`
  }

  return (
    <LocationContext.Provider
      value={{
        location,
        isLoading,
        error,
        requestLocation,
        verifyLocation,
        getLocationString,
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}

export const useLocation = () => {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error("useLocation must be used within LocationProvider")
  }
  return context
}
