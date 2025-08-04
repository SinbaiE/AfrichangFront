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
  ActivityIndicator,
  Modal,
  FlatList,
  Dimensions,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from "expo-router"
import { useAuth } from "@contexts/AuthContext"

const { width } = Dimensions.get("window")

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
      // Simulate registration
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      // await register({ // Uncomment and implement actual registration logic
      //   firstName: form.firstName,
      //   lastName: form.lastName,
      //   email: form.email,
      //   phone: form.phone,
      //   country: form.country,
      //   password: form.password,
      // })
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
        <View style={[styles.inputWrapper, errors.firstName ? styles.inputError : styles.inputDefault]}>
          <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Votre prénom"
            value={form.firstName}
            onChangeText={(text) => setForm({ ...form, firstName: text })}
            autoCapitalize="words"
            placeholderTextColor="#999"
          />
        </View>
        {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
      </View>
      <View>
        <Text style={styles.label}>Nom *</Text>
        <View style={[styles.inputWrapper, errors.lastName ? styles.inputError : styles.inputDefault]}>
          <Ionicons name="person-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Votre nom"
            value={form.lastName}
            onChangeText={(text) => setForm({ ...form, lastName: text })}
            autoCapitalize="words"
            placeholderTextColor="#999"
          />
        </View>
        {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
      </View>
      <View>
        <Text style={styles.label}>Pays de résidence *</Text>
        <TouchableOpacity
          style={[styles.countryPicker, errors.country ? styles.inputError : styles.inputDefault]}
          onPress={() => setShowCountryPicker(true)}
        >
          <Ionicons name="map-outline" size={20} color="#666" style={styles.inputIcon} />
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

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Coordonnées</Text>
      <Text style={styles.stepSubtitle}>Comment pouvons-nous vous contacter ?</Text>
      <View>
        <Text style={styles.label}>Adresse e-mail *</Text>
        <View style={[styles.inputWrapper, errors.email ? styles.inputError : styles.inputDefault]}>
          <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="email@exemple.com"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text.trim() })}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>
      <View>
        <Text style={styles.label}>Numéro de téléphone *</Text>
        <View style={[styles.inputWrapper, errors.phone ? styles.inputError : styles.inputDefault]}>
          <Ionicons name="call-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="+225 00 00 00 00"
            value={form.phone}
            onChangeText={(text) => setForm({ ...form, phone: text })}
            keyboardType="phone-pad"
            placeholderTextColor="#999"
          />
        </View>
        {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
      </View>
    </View>
  )

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Sécurité du compte</Text>
      <Text style={styles.stepSubtitle}>Créez un mot de passe sécurisé</Text>
      <View>
        <Text style={styles.label}>Mot de passe *</Text>
        <View style={[styles.inputWrapper, errors.password ? styles.inputError : styles.inputDefault]}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="********"
            value={form.password}
            onChangeText={(text) => setForm({ ...form, password: text })}
            secureTextEntry={!showPassword}
            placeholderTextColor="#999"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>
      <View>
        <Text style={styles.label}>Confirmer le mot de passe *</Text>
        <View style={[styles.inputWrapper, errors.confirmPassword ? styles.inputError : styles.inputDefault]}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="********"
            value={form.confirmPassword}
            onChangeText={(text) => setForm({ ...form, confirmPassword: text })}
            secureTextEntry={!showConfirmPassword}
            placeholderTextColor="#999"
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
            <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      </View>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => setForm({ ...form, acceptTerms: !form.acceptTerms })}
      >
        <Ionicons
          name={form.acceptTerms ? "checkbox-outline" : "square-outline"}
          size={24}
          color={form.acceptTerms ? "#667eea" : "#666"}
        />
        <Text style={styles.checkboxText}>
          J'accepte les <Text style={styles.linkText}>Termes et Conditions</Text>
        </Text>
      </TouchableOpacity>
    </View>
  )

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1()
      case 2:
        return renderStep2()
      case 3:
        return renderStep3()
      default:
        return null
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.headerGradient}>
        {/* Top navigation and branding */}
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => (currentStep > 1 ? setCurrentStep(currentStep - 1) : router.back())}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Créer un compte</Text>
          <Text style={styles.stepIndicator}>Étape {currentStep}/3</Text>
        </View>

        {/* AfriChange Branding */}
        <View style={styles.afriChangeBranding}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>🌍</Text>
          </View>
          <Text style={styles.mainTitle}>AfriChange</Text>
          <Text style={styles.mainSubtitle}>Échangez vos devises africaines facilement</Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, { width: `${(currentStep / 3) * 100}%` }]} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderCurrentStep()}

          <TouchableOpacity
            style={[styles.button, isLoading ? styles.buttonDisabled : styles.buttonEnabled]}
            onPress={handleNext}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>
                {currentStep === 3 ? "Créer mon compte" : "Continuer"}
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Déjà un compte ? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={styles.footerLink}>Se connecter</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Country Picker Modal */}
      <Modal visible={showCountryPicker} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={AFRICAN_COUNTRIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => {
                    setForm({ ...form, country: item.code })
                    setShowCountryPicker(false)
                  }}
                >
                  <Text style={styles.countryItemText}>
                    {item.flag} {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeButton} onPress={() => setShowCountryPicker(false)}>
              <Text style={styles.closeButtonText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc", // Light background for the whole screen
  },
  headerGradient: {
    height: 220, // Increased height to accommodate logo and branding
    justifyContent: "space-between", // Distribute content vertically
    paddingTop: 32,
    paddingHorizontal: 20, // Adjusted padding
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  headerTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  stepIndicator: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  afriChangeBranding: {
    alignItems: "center",
    marginBottom: 20, // Space before progress bar
  },
  logoContainer: {
    width: 60, // Smaller logo for signup header
    height: 60,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  logoText: {
    fontSize: 30, // Smaller emoji
  },
  mainTitle: {
    fontSize: 28, // Smaller title
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  mainSubtitle: {
    fontSize: 14, // Smaller subtitle
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    marginHorizontal: 0, // No horizontal margin here, it's full width
  },
  progressBar: {
    height: "100%",
    backgroundColor: "white",
    borderRadius: 2,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    marginTop: -30, // Pull the content up to overlap the header's curve
    backgroundColor: "#f8fafc", // Ensure content background matches safeArea
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  stepContainer: {
    gap: 20,
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#1e293b",
  },
  stepSubtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: "#1e293b",
  },
  eyeIcon: {
    padding: 5,
  },
  inputDefault: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  inputError: {
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
  countryPicker: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  countryText: {
    color: "#1e293b",
    fontSize: 16,
    flex: 1,
  },
  countryPlaceholder: {
    color: "#999",
    fontSize: 16,
    flex: 1,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  checkboxText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#64748b",
  },
  linkText: {
    color: "#764ba2",
    fontWeight: "600",
  },
  button: {
    marginTop: 32,
    borderRadius: 15,
    paddingVertical: 16,
    alignItems: "center",
    overflow: "hidden",
  },
  buttonEnabled: {
    // LinearGradient will handle background
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
    paddingBottom: 16,
  },
  footerText: {
    color: "#64748b",
    fontSize: 16,
  },
  footerLink: {
    color: "#764ba2",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "50%",
  },
  countryItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  countryItemText: {
    fontSize: 16,
    color: "#1e293b",
  },
  closeButton: {
    marginTop: 15,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: "#ef4444",
    fontWeight: "600",
  },
})