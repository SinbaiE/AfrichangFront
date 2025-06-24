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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showCountryPicker, setShowCountryPicker] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

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

  const validateForm = () => {
    const newErrors: Partial<SignupForm> = {}

    // Validation étape 1
    if (currentStep >= 1) {
      if (!form.firstName.trim()) newErrors.firstName = "Prénom requis"
      if (!form.lastName.trim()) newErrors.lastName = "Nom requis"
      if (!form.country) newErrors.country = "Pays requis"
    }

    // Validation étape 2
    if (currentStep >= 2) {
      if (!form.email.trim()) {
        newErrors.email = "Email requis"
      } else if (!/\S+@\S+\.\S+/.test(form.email)) {
        newErrors.email = "Email invalide"
      }

      if (!form.phone.trim()) {
        newErrors.phone = "Téléphone requis"
      } else if (form.phone.length < 8) {
        newErrors.phone = "Numéro trop court"
      }
    }

    // Validation étape 3
    if (currentStep >= 3) {
      if (!form.password) {
        newErrors.password = "Mot de passe requis"
      } else if (form.password.length < 8) {
        newErrors.password = "Minimum 8 caractères"
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
        newErrors.password = "Doit contenir majuscule, minuscule et chiffre"
      }

      if (form.password !== form.confirmPassword) {
        newErrors.confirmPassword = "Mots de passe différents"
      }

      // if (!form.acceptTerms) {
      //   newErrors.acceptTerms = "Accepter les conditions"
      // }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1)
      } else {
        handleSignup()
      }
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

      Alert.alert(
        "Compte créé !",
        "Votre compte a été créé avec succès. Vous allez maintenant compléter votre profil KYC.",
        [
          {
            text: "Continuer",
            onPress: () => router.push("/(auth)/kyc"),
          },
        ],
      )
    } catch (error: any) {
      Alert.alert("Erreur", error.message || "Erreur lors de la création du compte")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStepIndicator = () => (
    <View className="flex-row justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <View key={step} className="flex-row items-center">
          <View
            className={`w-8 h-8 rounded-full items-center justify-center ${
              step <= currentStep ? "bg-blue-500" : "bg-gray-300"
            }`}
          >
            <Text className={`text-sm font-bold ${step <= currentStep ? "text-white" : "text-gray-600"}`}>{step}</Text>
          </View>
          {step < 3 && <View className={`w-12 h-1 ${step < currentStep ? "bg-blue-500" : "bg-gray-300"}`} />}
        </View>
      ))}
    </View>
  )

  const renderStep1 = () => (
    <View className="space-y-4">
      <Text className="text-2xl font-bold text-center mb-2">Informations personnelles</Text>
      <Text className="text-gray-600 text-center mb-6">Commençons par vos informations de base</Text>

      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">Prénom *</Text>
        <TextInput
          className={`border rounded-lg px-4 py-3 ${errors.firstName ? "border-red-500" : "border-gray-300"}`}
          placeholder="Votre prénom"
          value={form.firstName}
          onChangeText={(text) => setForm({ ...form, firstName: text })}
          autoCapitalize="words"
        />
        {errors.firstName && <Text className="text-red-500 text-xs mt-1">{errors.firstName}</Text>}
      </View>

      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">Nom *</Text>
        <TextInput
          className={`border rounded-lg px-4 py-3 ${errors.lastName ? "border-red-500" : "border-gray-300"}`}
          placeholder="Votre nom"
          value={form.lastName}
          onChangeText={(text) => setForm({ ...form, lastName: text })}
          autoCapitalize="words"
        />
        {errors.lastName && <Text className="text-red-500 text-xs mt-1">{errors.lastName}</Text>}
      </View>

      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">Pays de résidence *</Text>
        <TouchableOpacity
          className={`border rounded-lg px-4 py-3 flex-row justify-between items-center ${
            errors.country ? "border-red-500" : "border-gray-300"
          }`}
          onPress={() => setShowCountryPicker(true)}
        >
          <Text className={form.country ? "text-black" : "text-gray-500"}>
            {form.country
              ? `${AFRICAN_COUNTRIES.find((c) => c.code === form.country)?.flag} ${
                  AFRICAN_COUNTRIES.find((c) => c.code === form.country)?.name
                }`
              : "Sélectionner votre pays"}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
        {errors.country && <Text className="text-red-500 text-xs mt-1">{errors.country}</Text>}
      </View>
    </View>
  )

  const renderStep2 = () => (
    <View className="space-y-4">
      <Text className="text-2xl font-bold text-center mb-2">Contact</Text>
      <Text className="text-gray-600 text-center mb-6">Comment pouvons-nous vous contacter ?</Text>

      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">Email *</Text>
        <TextInput
          className={`border rounded-lg px-4 py-3 ${errors.email ? "border-red-500" : "border-gray-300"}`}
          placeholder="votre@email.com"
          value={form.email}
          onChangeText={(text) => setForm({ ...form, email: text.toLowerCase() })}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text className="text-red-500 text-xs mt-1">{errors.email}</Text>}
      </View>

      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">Téléphone *</Text>
        <View className="flex-row">
          <View className="border border-gray-300 rounded-l-lg px-3 py-3 bg-gray-50">
            <Text className="text-gray-700">
              {AFRICAN_COUNTRIES.find((c) => c.code === form.country)?.flag || "🌍"}
            </Text>
          </View>
          <TextInput
            className={`flex-1 border border-l-0 rounded-r-lg px-4 py-3 ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Numéro de téléphone"
            value={form.phone}
            onChangeText={(text) => setForm({ ...form, phone: text })}
            keyboardType="phone-pad"
          />
        </View>
        {errors.phone && <Text className="text-red-500 text-xs mt-1">{errors.phone}</Text>}
      </View>
    </View>
  )

  const renderStep3 = () => (
    <View className="space-y-4">
      <Text className="text-2xl font-bold text-center mb-2">Sécurité</Text>
      <Text className="text-gray-600 text-center mb-6">Créez un mot de passe sécurisé</Text>

      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">Mot de passe *</Text>
        <View className="relative">
          <TextInput
            className={`border rounded-lg px-4 py-3 pr-12 ${errors.password ? "border-red-500" : "border-gray-300"}`}
            placeholder="Minimum 8 caractères"
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity className="absolute right-3 top-3" onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="#666" />
          </TouchableOpacity>
        </View>
        {errors.password && <Text className="text-red-500 text-xs mt-1">{errors.password}</Text>}
      </View>

      <View>
        <Text className="text-sm font-medium text-gray-700 mb-2">Confirmer le mot de passe *</Text>
        <View className="relative">
          <TextInput
            className={`border rounded-lg px-4 py-3 pr-12 ${
              errors.confirmPassword ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Répétez votre mot de passe"
            value={form.confirmPassword}
            onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity
            className="absolute right-3 top-3"
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#666" />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && <Text className="text-red-500 text-xs mt-1">{errors.confirmPassword}</Text>}
      </View>

      <TouchableOpacity
        className="flex-row items-center mt-4"
        onPress={() => setForm({ ...form, acceptTerms: !form.acceptTerms })}
      >
        <View
          className={`w-5 h-5 border-2 rounded mr-3 items-center justify-center ${
            form.acceptTerms ? "bg-blue-500 border-blue-500" : "border-gray-300"
          }`}
        >
          {form.acceptTerms && <Ionicons name="checkmark" size={12} color="white" />}
        </View>
        <Text className="text-sm text-gray-700 flex-1">
          J'accepte les <Text className="text-blue-500 underline">conditions d'utilisation</Text> et la{" "}
          <Text className="text-blue-500 underline">politique de confidentialité</Text>
        </Text>
      </TouchableOpacity>
      {errors.acceptTerms && <Text className="text-red-500 text-xs mt-1">{errors.acceptTerms}</Text>}
    </View>
  )

  const renderCountryPicker = () => (
    <View className="absolute inset-0 bg-black/50 justify-center items-center z-50">
      <View className="bg-white rounded-lg m-4 max-h-96 w-80">
        <View className="p-4 border-b border-gray-200">
          <Text className="text-lg font-bold text-center">Sélectionner votre pays</Text>
        </View>
        <ScrollView className="max-h-80">
          {AFRICAN_COUNTRIES.map((country) => (
            <TouchableOpacity
              key={country.code}
              className="flex-row items-center p-4 border-b border-gray-100"
              onPress={() => {
                setForm({ ...form, country: country.code })
                setShowCountryPicker(false)
              }}
            >
              <Text className="text-2xl mr-3">{country.flag}</Text>
              <View className="flex-1">
                <Text className="font-medium">{country.name}</Text>
                <Text className="text-sm text-gray-500">{country.currency}</Text>
              </View>
              {form.country === country.code && <Ionicons name="checkmark" size={20} color="#3B82F6" />}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity className="p-4 border-t border-gray-200" onPress={() => setShowCountryPicker(false)}>
          <Text className="text-center text-gray-600">Annuler</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <SafeAreaView className="flex-1 bg-white">
      <LinearGradient colors={["#3B82F6", "#1E40AF"]} className="h-32">
        <View className="flex-row items-center justify-between p-4 pt-8">
          <TouchableOpacity onPress={() => (currentStep > 1 ? setCurrentStep(currentStep - 1) : router.back())}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-semibold">Créer un compte</Text>
          <View className="w-6" />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
        <ScrollView className="flex-1 px-6 py-6">
          {renderStepIndicator()}

          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}

          <TouchableOpacity
            className={`mt-8 py-4 rounded-lg ${isLoading ? "bg-gray-400" : "bg-blue-500"}`}
            onPress={handleNext}
            disabled={isLoading}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {isLoading ? "Création..." : currentStep === 3 ? "Créer mon compte" : "Continuer"}
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center items-center mt-6">
            <Text className="text-gray-600">Déjà un compte ? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text className="text-blue-500 font-semibold">Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {showCountryPicker && renderCountryPicker()}
    </SafeAreaView>
  )
}
