"use client"

import type React from "react"
import { createContext, useContext, useState, type ReactNode } from "react"

// Définition de la nouvelle charte graphique
const afriChangeColors = {
  primaryYellow: "#FFC107", // Jaune Or Africain
  emeraldGreen: "#10b981", // Vert Émeraude
  earthBrown: "#5D4037", // Terre Africaine (pour le texte)
  lightBeige: "#FFF8E1", // Fond clair (crème/beige)
  white: "#FFFFFF",
  lightGray: "#F5F5F5", // Gris clair pour les bordures/surfaces
  darkGray: "#333333", // Texte pour le mode sombre
  darkSurface: "#2d2d2d", // Surface pour le mode sombre
  darkBackground: "#1a1a1a", // Fond pour le mode sombre
  success: "#4ade80", // Vert pour succès
  warning: "#f59e0b", // Orange pour avertissement
  error: "#ef4444", // Rouge pour erreur
}

interface ThemeColors {
  primary: string
  secondary: string
  background: string
  surface: string
  text: string
  textSecondary: string
  border: string
  success: string
  warning: string
  error: string
  info: string
  earthBrown: string
}

interface ThemeContextType {
  isDark: boolean
  colors: ThemeColors
  toggleTheme: () => void
}

const lightColors: ThemeColors = {
  primary: afriChangeColors.primaryYellow,
  secondary: afriChangeColors.emeraldGreen,
  background: afriChangeColors.lightBeige,
  surface: afriChangeColors.white,
  text: afriChangeColors.earthBrown,
  textSecondary: "#6B7280", // Gardé neutre
  border: afriChangeColors.lightGray,
  success: afriChangeColors.success,
  warning: afriChangeColors.warning,
  error: afriChangeColors.error,
  info: afriChangeColors.emeraldGreen,
  earthBrown: afriChangeColors.earthBrown,
}

const darkColors: ThemeColors = {
  primary: afriChangeColors.primaryYellow,
  secondary: afriChangeColors.emeraldGreen,
  background: afriChangeColors.darkBackground,
  surface: afriChangeColors.darkSurface,
  text: afriChangeColors.white,
  textSecondary: "#D1D5DB", // Gardé neutre
  border: "#404040",
  success: afriChangeColors.success,
  warning: afriChangeColors.warning,
  error: afriChangeColors.error,
  info: afriChangeColors.emeraldGreen,
  earthBrown: afriChangeColors.earthBrown,
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
  }

  const colors = isDark ? darkColors : lightColors

  return <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>{children}</ThemeContext.Provider>
}
