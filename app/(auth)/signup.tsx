"use client"

import React, { useState } from "react"
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
  ActivityIndicator,
  Modal,
  FlatList,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useAuth } from "@/contexts/AuthContext"
import { useTheme } from "@/contexts/ThemeContext"

interface SignupForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  password: string
  confirmPassword: string
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
  const { colors } = useTheme()
  const [isLoading, setIsLoading] = useState(false)
  const [form, setForm] = useState<SignupForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Partial<SignupForm>>({})
  const [currentStep, setCurrentStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showCountryPicker, setShowCountryPicker] = useState(false)

  const validateStep = (step: number) => {
    const newErrors: Partial<SignupForm> = {}
    if (step === 1) {
      if (!form.firstName.trim()) newErrors.firstName = "Prénom requis"
      if (!form.lastName.trim()) newErrors.lastName = "Nom requis"
      if (!form.country) newErrors.country = "Pays requis"
    }
    if (step === 2) {
      if (!form.email.trim()) newErrors.email = "Email requis"
      else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Email invalide"
      if (!form.phone.trim()) newErrors.phone = "Téléphone requis"
    }
    if (step === 3) {
      if (!form.password) newErrors.password = "Mot de passe requis"
      else if (form.password.length < 8) newErrors.password = "Minimum 8 caractères"
      if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1)
      } else {
        handleSignup()
      }
    }
  }

  const handleSignup = async () => {
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return
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

  const renderStepContent = () => {
    if (currentStep === 1) {
      return (
        <View style={styles.stepContainer}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Prénom</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: errors.firstName ? colors.error : colors.border }]} placeholder="Ex: John" value={form.firstName} onChangeText={(text) => setForm({ ...form, firstName: text })} autoCapitalize="words" />
            {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Nom</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: errors.lastName ? colors.error : colors.border }]} placeholder="Ex: Doe" value={form.lastName} onChangeText={(text) => setForm({ ...form, lastName: text })} autoCapitalize="words" />
            {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Pays de résidence</Text>
            <TouchableOpacity style={[styles.input, styles.pickerButton, { backgroundColor: colors.surface, borderColor: errors.country ? colors.error : colors.border }]} onPress={() => setShowCountryPicker(true)}>
              <Text style={{ color: form.country ? colors.text : colors.textSecondary }}>{form.country ? AFRICAN_COUNTRIES.find(c => c.code === form.country)?.name : "Sélectionner votre pays"}</Text>
              <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            {errors.country && <Text style={styles.errorText}>{errors.country}</Text>}
          </View>
        </View>
      )
    }
    if (currentStep === 2) {
      return (
        <View style={styles.stepContainer}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Adresse e-mail</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: errors.email ? colors.error : colors.border }]} placeholder="email@exemple.com" value={form.email} onChangeText={(text) => setForm({ ...form, email: text.trim() })} keyboardType="email-address" autoCapitalize="none" />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Numéro de téléphone</Text>
            <TextInput style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: errors.phone ? colors.error : colors.border }]} placeholder="+225 00 00 00 00" value={form.phone} onChangeText={(text) => setForm({ ...form, phone: text })} keyboardType="phone-pad" />
            {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
          </View>
        </View>
      )
    }
    if (currentStep === 3) {
      return (
        <View style={styles.stepContainer}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Mot de passe</Text>
            <View style={[styles.input, styles.passwordContainer, { backgroundColor: colors.surface, borderColor: errors.password ? colors.error : colors.border }]}>
              <TextInput style={[styles.passwordInput, { color: colors.text }]} placeholder="********" value={form.password} onChangeText={(text) => setForm({ ...form, password: text })} secureTextEntry={!showPassword} />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}><Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color={colors.textSecondary} /></TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          </View>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Confirmer le mot de passe</Text>
            <View style={[styles.input, styles.passwordContainer, { backgroundColor: colors.surface, borderColor: errors.confirmPassword ? colors.error : colors.border }]}>
              <TextInput style={[styles.passwordInput, { color: colors.text }]} placeholder="********" value={form.confirmPassword} onChangeText={(text) => setForm({ ...form, confirmPassword: text })} secureTextEntry={!showConfirmPassword} />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}><Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color={colors.textSecondary} /></TouchableOpacity>
            </View>
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
          </View>
        </View>
      )
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => (currentStep > 1 ? setCurrentStep(currentStep - 1) : router.back())}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Créer un compte</Text>
        <Text style={[styles.stepIndicator, { color: colors.primary }]}>Étape {currentStep}/3</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            {renderStepContent()}
          </View>

          <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={handleNext} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color={colors.earthBrown} /> : <Text style={[styles.buttonText, { color: colors.earthBrown }]}>{currentStep === 3 ? "Terminer l'inscription" : "Continuer"}</Text>}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textSecondary }]}>Déjà un compte ? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={[styles.footerLink, { color: colors.secondary }]}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showCountryPicker} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <FlatList
              data={AFRICAN_COUNTRIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.countryItem} onPress={() => { setForm({ ...form, country: item.code }); setShowCountryPicker(false); }}>
                  <Text>{item.flag} {item.name}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowCountryPicker(false)}>
              <Text style={{ color: colors.error }}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 16, paddingHorizontal: 16, paddingBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  stepIndicator: { fontSize: 14, fontWeight: "600" },
  scrollContent: { flexGrow: 1, justifyContent: "space-between", padding: 24 },
  formContainer: { flex: 1 },
  stepContainer: { gap: 16 },
  inputGroup: { marginBottom: 12 },
  label: { fontSize: 14, fontWeight: "500", marginBottom: 8 },
  input: { borderRadius: 8, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, fontSize: 16 },
  errorText: { color: "#ef4444", fontSize: 12, marginTop: 4 },
  pickerButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1, fontSize: 16 },
  button: { marginTop: 24, borderRadius: 8, paddingVertical: 16, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: "bold" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 24, paddingBottom: 16 },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: "bold" },
  modalContainer: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, maxHeight: '50%' },
  countryItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  closeButton: { marginTop: 16, padding: 16, alignItems: 'center' },
})
