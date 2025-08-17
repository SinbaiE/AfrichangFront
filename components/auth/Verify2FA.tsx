import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';

export const Verify2FA = () => {
  const { verifyAndLogin } = useAuth();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) {
      Alert.alert('Erreur', 'Le code de vérification doit contenir 6 chiffres.');
      return;
    }

    setIsVerifying(true);
    try {
      await verifyAndLogin(code);
      // On success, the AuthContext will set the user and isAuthenticated to true.
      // The root layout should handle the navigation to the main app.
      // We can also navigate manually if needed.
      Alert.alert('Succès', 'Vérification réussie !');
      router.replace('/(tabs)/'); // Navigate to the main app screen
    } catch (error) {
      Alert.alert('Erreur', 'Le code est invalide ou a expiré. Veuillez réessayer.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Vérification à deux facteurs
      </Text>

      <Text style={styles.instructions}>
        Veuillez entrer le code à 6 chiffres généré par votre application d'authentification.
      </Text>

      <TextInput
        style={styles.codeInput}
        value={code}
        onChangeText={setCode}
        keyboardType="numeric"
        maxLength={6}
        placeholder="123 456"
        placeholderTextColor="#999"
        autoFocus={true}
      />

      <Button
        title={isVerifying ? "Vérification..." : "Vérifier le code"}
        onPress={handleVerify}
        disabled={isVerifying || code.length !== 6}
      />
      {isVerifying && <ActivityIndicator style={{ marginTop: 20 }} size="large" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1e293b',
  },
  instructions: {
    textAlign: 'center',
    marginBottom: 25,
    fontSize: 16,
    color: '#475569',
    maxWidth: '90%',
  },
  codeInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
    padding: 15,
    width: 200,
    textAlign: 'center',
    fontSize: 28,
    borderRadius: 8,
    marginBottom: 30,
    letterSpacing: 10,
  },
});
