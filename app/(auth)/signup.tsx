"use client"

import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useAuth } from "@contexts/AuthContext"

interface SignupForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  password: string
  confirmPassword: string
  acceptTerms: boolean
}

const AFRICAN_COUNTRIES = [
  { code: "BF", name: "Burkina Faso", currency: "XOF", flag: "🇧🇫" },
  { code: "CI", name: "Côte d'Ivoire", currency: "XOF", flag: "🇨🇮" },
  { code: "GH", name: "Ghana", currency: "GHS", flag: "🇬🇭" },
  { code: "NG", name: "Nigeria", currency: "NGN", flag: "🇳🇬" },
  { code: "SN", name: "Sénégal", currency: "XOF", flag: "🇸🇳" },
  { code: "ML", name: "Mali", currency: "XOF", flag: "🇲🇱" },
  { code: "TG", name: "Togo", currency: "XOF", flag: "🇹🇬" },
  { code: "BJ", name: "Bénin", currency: "XOF", flag: "🇧🇯" },
  { code: "KE", name: "Kenya", currency: "KES", flag: "🇰🇪" },
  { code: "UG", name: "Uganda", currency: "UGX", flag: "🇺🇬" },
  { code: "TZ", name: "Tanzania", currency: "TZS", flag: "🇹🇿" },
  { code: "RW", name: "Rwanda", currency: "RWF", flag: "🇷🇼" },
  { code: "ZA", name: "South Africa", currency: "ZAR", flag: "🇿🇦" },
  { code: "MA", name: "Morocco", currency: "MAD", flag: "🇲🇦" },
  { code: "EG", name: "Egypt", currency: "EGP", flag: "🇪🇬" },
]

export default function SignupScreen() {
  const router = useRouter()
  const { register } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState<SignupForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  })
  const [errors, setErrors] = useState<Partial<SignupForm>>({})
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showCountryPicker, setShowCountryPicker] = useState(false)

  const validateForm = () => {
    const newErrors: Partial<SignupForm> = {}
    if (currentStep >= 1) {
      if (!form.firstName.trim()) newErrors.firstName = "Prénom requis"
      if (!form.lastName.trim()) newErrors.lastName = "Nom requis"
      if (!form.country) newErrors.country = "Pays requis"
    }
    if (currentStep >= 2) {
      if (!form.email.trim()) newErrors.email = "Email requis"
      else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email invalide"
      if (!form.phone.trim()) newErrors.phone = "Téléphone requis"
      else if (form.phone.length < 8) newErrors.phone = "Numéro trop court"
    }
    if (currentStep >= 3) {
      if (!form.password) newErrors.password = "Mot de passe requis"
      else if (form.password.length < 8) newErrors.password = "Minimum 8 caractères"
      else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
        newErrors.password = "Doit contenir majuscule, minuscule et chiffre"
      }
      if (form.password !== form.confirmPassword) {
        newErrors.confirmPassword = "Mots de passe différents"
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      if (currentStep < 3) setCurrentStep(currentStep + 1)
      else handleSignup()
    }
  }

  const handleSignup = async () => {
    if (!validateForm()) return
    setIsLoading(true)
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        country: form.country,
        password: form.password,
      })
      Alert.alert("Compte créé !", "Votre compte a été créé avec succès.", [
        { text: "Continuer", onPress: () => router.push("/(auth)/kyc") },
      ])
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Erreur lors de la création du compte")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Informations personnelles</Text>
      <Text style={styles.stepSubtitle}>Commençons par vos informations de base</Text>

      <View>
        <Text style={styles.label}>Prénom *</Text>
        <TextInput
          style={[styles.input, errors.firstName ? styles.inputError : styles.inputDefault]}
          placeholder="Votre prénom"
          value={form.firstName}
          onChangeText={(text) => setForm({ ...form, firstName: text })}
          autoCapitalize="words"
        />
        {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
      </View>

      <View>
        <Text style={styles.label}>Nom *</Text>
        <TextInput
          style={[styles.input, errors.lastName ? styles.inputError : styles.inputDefault]}
          placeholder="Votre nom"
          value={form.lastName}
          onChangeText={(text) => setForm({ ...form, lastName: text })}
          autoCapitalize="words"
        />
        {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
      </View>

      <View>
        <Text style={styles.label}>Pays de résidence *</Text>
        <TouchableOpacity
          style={[styles.countryPicker, errors.country ? styles.inputError : styles.inputDefault]}
          onPress={() => setShowCountryPicker(true)}
        >
          <Text style={form.country ? styles.countryText : styles.countryPlaceholder}>
            {form.country
              ? `${AFRICAN_COUNTRIES.find((c) => c.code === form.country)?.flag} ${
                  AFRICAN_COUNTRIES.find((c) => c.code === form.country)?.name
                }`
              : "Sélectionner votre pays"}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
        {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#3B82F6", "#1E40AF"]} style={styles.headerGradient}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => (currentStep > 1 ? setCurrentStep(currentStep - 1) : router.back())}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Créer un compte</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {currentStep === 1 && renderStep1()}

          <TouchableOpacity
            style={[styles.button, isLoading ? styles.buttonDisabled : styles.buttonEnabled]}
            onPress={handleNext}
            disabled={isLoading}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Création..." : currentStep === 3 ? "Créer mon compte" : "Continuer"}
            </Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà un compte ? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.footerLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "white",
  },
  headerGradient: {
    height: 128,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 32,
    paddingHorizontal: 16,
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  stepContainer: {
    gap: 16,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputDefault: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
  },
  countryPicker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  countryText: {
    color: "black",
  },
  countryPlaceholder: {
    color: "#9CA3AF",
  },
  button: {
    marginTop: 32,
    borderRadius: 8,
    paddingVertical: 16,
  },
  buttonEnabled: {
    backgroundColor: "#3B82F6",
  },
  buttonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#4B5563",
  },
  footerLink: {
    color: "#3B82F6",
    fontWeight: "600",
  },
})
