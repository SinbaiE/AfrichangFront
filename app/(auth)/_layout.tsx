import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen name="login" options={{ title: 'Connexion', headerShown: false }} />
      <Stack.Screen name="signup" options={{ title: 'Inscription' }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="verify-2fa" options={{ title: 'Vérification 2FA' }} />
      <Stack.Screen name="setup-2fa" options={{ title: 'Configuration 2FA' }} />
      {/* The other screens like kyc and dasboardUsers will also be part of this stack */}
      <Stack.Screen name="dasboardUsers" options={{ title: 'Dashboard Utilisateur' }} />
      <Stack.Screen name="kyc" options={{ headerShown: false }} />
    </Stack>
  );
}
