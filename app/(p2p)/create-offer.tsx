import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ExchangeService } from '@/services/ExchangeService';
import { useWallet } from '@/contexts/WalletContext'; // Assuming this context provides wallet info

export default function P2PCreateOfferScreen() {
  const { wallets } = useWallet(); // Get user's wallets
  const [fromAmount, setFromAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('XOF'); // Default values
  const [toAmount, setToAmount] = useState('');
  const [toCurrency, setToCurrency] = useState('NGN');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableBalance = useMemo(() => {
    const wallet = wallets.find(w => w.currency.code === fromCurrency);
    return wallet ? wallet.balance : 0;
  }, [fromCurrency, wallets]);

  const impliedRate = useMemo(() => {
    const from = parseFloat(fromAmount);
    const to = parseFloat(toAmount);
    if (from > 0 && to > 0) {
      return to / from;
    }
    return 0;
  }, [fromAmount, toAmount]);

  const handleSubmit = async () => {
    const from = parseFloat(fromAmount);
    const to = parseFloat(toAmount);

    if (!(from > 0) || !(to > 0)) {
      Alert.alert("Erreur", "Veuillez entrer des montants valides.");
      return;
    }

    if (from > availableBalance) {
      Alert.alert("Fonds insuffisants", `Votre solde en ${fromCurrency} est insuffisant pour créer cette offre.`);
      return;
    }

    setIsSubmitting(true);
    try {
      await ExchangeService.createOffer({
        fromCurrency,
        fromAmount: from,
        toCurrency,
        toAmount: to,
        type: 'P2P', // Assuming the backend needs a type distinguisher
      });
      Alert.alert("Succès", "Votre offre a été créée avec succès.", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error("Failed to create offer:", error);
      Alert.alert("Erreur", "La création de l'offre a échoué. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // In a real app, currency selectors would be custom dropdowns/modals.
  // For simplicity, we'll use TextInput here but structure it for easy replacement.

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Créer une Offre P2P</Text>
        </View>

        <View style={styles.form}>
          {/* From Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Je vends</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                value={fromAmount}
                onChangeText={setFromAmount}
                keyboardType="numeric"
              />
              <View style={styles.currencySelector}>
                <Text style={styles.currencyText}>{fromCurrency}</Text>
              </View>
            </View>
            <Text style={styles.balanceText}>Solde disponible: {availableBalance.toLocaleString()} {fromCurrency}</Text>
          </View>

          {/* To Section */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Je reçois</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                value={toAmount}
                onChangeText={setToAmount}
                keyboardType="numeric"
              />
              <View style={styles.currencySelector}>
                <Text style={styles.currencyText}>{toCurrency}</Text>
              </View>
            </View>
          </View>

          {/* Rate Summary */}
          {impliedRate > 0 && (
            <View style={styles.rateSummary}>
              <Text style={styles.rateLabel}>Taux de change implicite</Text>
              <Text style={styles.rateValue}>1 {fromCurrency} ≈ {impliedRate.toFixed(4)} {toCurrency}</Text>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Créer l'offre</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  scrollContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    flex: 1,
    marginLeft: -32, // Center title correctly
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    paddingVertical: 16,
  },
  currencySelector: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  currencyText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  balanceText: {
    marginTop: 8,
    color: '#667eea',
    fontSize: 12,
  },
  rateSummary: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    marginVertical: 16,
  },
  rateLabel: {
    color: '#6c63ff',
    marginBottom: 4,
  },
  rateValue: {
    color: '#6c63ff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#6c63ff',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    backgroundColor: '#a5a1ff',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
