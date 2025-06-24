"use client"

import { View, Text, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

export default function WelcomeScreen() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1">
      <LinearGradient colors={["#3B82F6", "#1E40AF", "#1E3A8A"]} className="flex-1">
        <View className="flex-1 justify-center items-center px-6">
          {/* Logo */}
          <View className="bg-white/20 rounded-full p-8 mb-8">
            <Ionicons name="swap-horizontal" size={64} color="white" />
          </View>

          {/* Titre principal */}
          <Text className="text-4xl font-bold text-white text-center mb-4">AfriChange</Text>

          <Text className="text-xl text-white/90 text-center mb-2">L'échange de devises africaines</Text>

          <Text className="text-lg text-white/80 text-center mb-12">Simple, rapide et sécurisé</Text>

          {/* Fonctionnalités */}
          <View className="space-y-4 mb-12">
            <View className="flex-row items-center">
              <View className="bg-white/20 rounded-full p-2 mr-4">
                <Ionicons name="flash" size={20} color="white" />
              </View>
              <Text className="text-white text-lg">Échanges instantanés</Text>
            </View>

            <View className="flex-row items-center">
              <View className="bg-white/20 rounded-full p-2 mr-4">
                <Ionicons name="shield-checkmark" size={20} color="white" />
              </View>
              <Text className="text-white text-lg">100% sécurisé</Text>
            </View>

            <View className="flex-row items-center">
              <View className="bg-white/20 rounded-full p-2 mr-4">
                <Ionicons name="trending-down" size={20} color="white" />
              </View>
              <Text className="text-white text-lg">Frais réduits</Text>
            </View>
          </View>

          {/* Boutons d'action */}
          <View className="w-full space-y-4">
            <TouchableOpacity className="bg-white py-4 rounded-lg" onPress={() => router.push("/(auth)/signup")}>
              <Text className="text-blue-600 text-center font-semibold text-lg">Créer un compte</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="border-2 border-white py-4 rounded-lg"
              onPress={() => router.push('/(auth)/login')}
            >
              <Text className="text-white text-center font-semibold text-lg">Se connecter</Text>
            </TouchableOpacity>
          </View>

          {/* Pays supportés */}
          <View className="mt-8">
            <Text className="text-white/80 text-center mb-4">Pays supportés :</Text>
            <View className="flex-row justify-center space-x-2">
              <Text className="text-2xl">🇧🇫</Text>
              <Text className="text-2xl">🇨🇮</Text>
              <Text className="text-2xl">🇬🇭</Text>
              <Text className="text-2xl">🇳🇬</Text>
              <Text className="text-2xl">🇸🇳</Text>
              <Text className="text-2xl">🇰🇪</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  )
}
