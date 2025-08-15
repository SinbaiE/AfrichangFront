"use client"

// import { View, Text, TextInput, Pressable, Alert, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native"
import { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  // SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { useAuth } from "@/contexts/AuthContext"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"

export default function LoginScreen() {
  const router = useRouter()
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Tous les champs sont requis.")
      return
    }

    setIsLoading(true);
    try {
      // Correctly use the login function from the AuthContext
      await login(email, password);

      // On success, AuthContext will set isAuthenticated to true,
      // which should trigger navigation in the root layout.
      // Or we can navigate manually.
      Alert.alert('Succès', 'Connexion réussie.');
      router.replace("/(auth)/dasboardUsers"); // Navigate to the main app screen
    } catch (error: any) {
      // The error is already processed by the service/client layer
      Alert.alert('Erreur de connexion', error.message || 'Une erreur inconnue est survenue.');
    } finally {
      setIsLoading(false)
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        {/* <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🌍</Text>
        </View> */}
        <Text style={styles.title}>AfriChange</Text>
        <Text style={styles.subtitle}>Échangez vos devises africaines facilement</Text>
      </LinearGradient>

      <View style={styles.form}>
        <Text style={styles.formTitle}>Connexion</Text>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholderTextColor="#999"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.forgotPassword}>
          <Text style={styles.forgotPasswordText}>Mot de passe oublié ?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.loginButtonGradient}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginButtonText}>Se connecter</Text>}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Pas encore de compte ? </Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/dasboardUsers")}>
            <Text style={styles.signupLink}>S'inscrire</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OU</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity style={styles.biometricButton}>
          <Ionicons name="finger-print-outline" size={24} color='red' />
          <Text style={styles.biometricText}>Connexion biométrique</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    height: 180, // Increased height to accommodate logo and branding
    justifyContent: "space-between", // Distribute content vertically
    paddingTop: 32,
    paddingHorizontal: 20, // Adjusted padding
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: "hidden",
  },
  logoContainer: {
    width: 50,
    height: 50,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoText: {
    fontSize: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    marginLeft:30,
    marginTop:20,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
    marginBottom:10,
  },
  form: {
    flex: 1,
    padding: 30,
    paddingTop: 40,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 30,
    textAlign: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 20,
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
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: "#764ba2",
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    borderRadius: 15,
    overflow: "hidden",
    marginBottom: 30,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e1e5e9",
  },
  dividerText: {
    marginHorizontal: 15,
    color: "#64748b",
    fontSize: 14,
  },
  biometricButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 15,
    borderRadius: 15,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  biometricText: {
    marginLeft: 10,
    fontSize: 16,
    color: 'red',
    fontWeight: "600",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  signupText: {
    color: "#64748b",
    fontSize: 16,
  },
  signupLink: {
    color: "#764ba2",
    fontSize: 16,
    fontWeight: "600",
  },
})
