import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';

const AFRICAN_CURRENCIES = ['XOF', 'XAF', 'NGN', 'GHS', 'ZAR', 'KES'];

export default function P2PCreateScreen() {
  const { colors } = useTheme();
  const [offerType, setOfferType] = useState<'buy' | 'sell'>('sell');
  const [fromAmount, setFromAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('XOF');
  const [toAmount, setToAmount] = useState('');
  const [toCurrency, setToCurrency] = useState('NGN');
  const [isLoading, setIsLoading] = useState(false);

  const impliedRate = useMemo(() => {
    const from = parseFloat(fromAmount);
    const to = parseFloat(toAmount);
    if (from > 0 && to > 0) {
      return to / from;
    }
    return 0;
  }, [fromAmount, toAmount]);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const payload = {
        fromCurrency,
        toCurrency,
        amount: parseFloat(fromAmount),
        rate: 1 / impliedRate, // Assuming rate is fromCurrency -> toCurrency
      };
      await P2PService.createOffer(payload);
      Alert.alert(
        "Offre Créée",
        "Votre offre a été placée sur le marché P2P.",
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert("Erreur", "Impossible de créer l'offre.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Créer une Offre P2P</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.form}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Type d'opération</Text>
          <View style={styles.offerTypeContainer}>
            <TouchableOpacity
              style={[styles.offerTypeButton, offerType === 'sell' && { backgroundColor: colors.primary }]}
              onPress={() => setOfferType('sell')}
            >
              <Text style={[styles.offerTypeText, offerType === 'sell' && { color: colors.earthBrown }]}>Je Vends</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.offerTypeButton, offerType === 'buy' && { backgroundColor: colors.secondary }]}
              onPress={() => setOfferType('buy')}
            >
              <Text style={[styles.offerTypeText, offerType === 'buy' && { color: '#fff' }]}>J'Achète</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Détails de la transaction</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Je {offerType === 'sell' ? 'vends' : 'veux acheter'}</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={fromAmount}
                onChangeText={setFromAmount}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
              <Text style={[styles.currencyLabel, { color: colors.text }]}>{fromCurrency}</Text>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Et je {offerType === 'sell' ? 'veux recevoir' : 'donne en échange'}</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={toAmount}
                onChangeText={setToAmount}
                placeholder="0.00"
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
              <Text style={[styles.currencyLabel, { color: colors.text }]}>{toCurrency}</Text>
            </View>
          </View>

          {impliedRate > 0 && (
            <View style={styles.summary}>
              <Text style={[styles.summaryText, { color: colors.textSecondary }]}>Votre taux de change implicite sera de</Text>
              <Text style={[styles.summaryRate, { color: colors.text }]}>1 {fromCurrency} ≈ {impliedRate.toFixed(4)} {toCurrency}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: colors.secondary }]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Placer mon offre</Text>
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollContainer: {
    padding: 16,
  },
  form: {},
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  offerTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  offerTypeButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8,
    backgroundColor: '#e0e0e0'
  },
  offerTypeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 18,
    paddingVertical: 12,
  },
  currencyLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  summary: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#FFC10720',
    marginVertical: 24,
  },
  summaryText: {
    fontSize: 14,
    marginBottom: 4,
  },
  summaryRate: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  submitButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
