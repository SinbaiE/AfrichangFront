import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, Alert, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { AuthService } from '@/services/AuthService';
import { useRouter } from 'expo-router';

export const Setup2FA = () => {
  const [qrCodeData, setQrCodeData] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setupTwoFactor();
  }, []);

  const setupTwoFactor = async () => {
    try {
      const response = await AuthService.setup2FA();
      setQrCodeData(response.qrCodeURL);
      setSecret(response.secret);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de démarrer la configuration de la 2FA.');
    }
  };

  const verifyAndEnable = async () => {
    if (verificationCode.length !== 6) {
      Alert.alert('Erreur', 'Le code de vérification doit contenir 6 chiffres.');
      return;
    }

    setIsVerifying(true);
    try {
      // Note: The guide implies the secret might be needed, but the backend should handle it session-side.
      // We only need to send the code the user provides for verification.
      await AuthService.enable2FA(verificationCode);
      Alert.alert('Succès', 'Authentification à deux facteurs activée avec succès !');
      router.replace('/(tabs)/profile'); // Redirect to a relevant screen, e.g., profile or settings
    } catch (error) {
      Alert.alert('Erreur', 'Le code de vérification est invalide. Veuillez réessayer.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Configurer la 2FA
      </Text>

      <Text style={styles.instructions}>
        1. Scannez ce QR code avec une application d'authentification (ex: Google Authenticator).
      </Text>

      <View style={styles.qrCodeContainer}>
        {qrCodeData ? (
          <QRCode
            value={qrCodeData}
            size={220}
            backgroundColor="white"
            color="black"
          />
        ) : (
          <Text>Génération du QR code...</Text>
        )}
      </View>

      <Text style={styles.instructions}>
        Ou entrez ce code manuellement :
      </Text>
      <TextInput
        style={styles.secretInput}
        value={secret}
        editable={false}
        selectTextOnFocus
      />

      <Text style={styles.instructions}>
        2. Entrez le code à 6 chiffres généré par l'application pour vérifier et activer :
      </Text>

      <TextInput
        style={styles.codeInput}
        value={verificationCode}
        onChangeText={setVerificationCode}
        keyboardType="numeric"
        maxLength={6}
        placeholder="123456"
        placeholderTextColor="#999"
      />

      <Button
        title={isVerifying ? "Vérification en cours..." : "Activer la 2FA"}
        onPress={verifyAndEnable}
        disabled={isVerifying || verificationCode.length !== 6}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
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
    marginBottom: 15,
    fontSize: 16,
    color: '#475569',
    maxWidth: '90%',
  },
  qrCodeContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  secretInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    width: '80%',
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
    backgroundColor: '#eee',
    borderRadius: 8,
    marginBottom: 20,
    fontFamily: 'SpaceMono-Regular', // Assuming a monospace font is available
  },
  codeInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: 'white',
    padding: 12,
    width: 180,
    textAlign: 'center',
    fontSize: 24,
    borderRadius: 8,
    marginBottom: 20,
    letterSpacing: 8,
  },
});
