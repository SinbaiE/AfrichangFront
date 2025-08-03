import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ExchangeService } from '@/services/ExchangeService';
import { useWallet } from '@/contexts/WalletContext';
import type { ExchangeOffer } from '@/types';

export default function P2POfferDetailScreen() {
  const params = useLocalSearchParams();
  const { id, offer: offerString } = params;
  const offer: ExchangeOffer = useMemo(() => JSON.parse(offerString as string), [offerString]);

  const { wallets } = useWallet();
  const [isAccepting, setIsAccepting] = useState(false);

  // The currency the current user needs to have to accept the offer
  const requiredCurrency = offer.toCurrency;
  const requiredAmount = offer.toAmount;

  const userBalance = useMemo(() => {
    const wallet = wallets.find(w => w.currency.code === requiredCurrency);
    return wallet ? wallet.balance : 0;
  }, [requiredCurrency, wallets]);

  const hasSufficientFunds = userBalance >= requiredAmount;

  const handleAcceptOffer = async () => {
    if (!hasSufficientFunds) {
      Alert.alert("Fonds insuffisants", `Vous n'avez pas assez de ${requiredCurrency} pour accepter cette offre.`);
      return;
    }

    setIsAccepting(true);
    try {
      // `createOrder` likely takes the offer ID to execute against
      await ExchangeService.createOrder({ offerId: offer.id });
      Alert.alert(
        "Échange Réussi",
        "La transaction a été complétée avec succès.",
        [{ text: "OK", onPress: () => router.replace('/(p2p)/market') }]
      );
    } catch (error) {
      console.error("Failed to accept offer:", error);
      Alert.alert("Erreur", "L'acceptation de l'offre a échoué. Elle n'est peut-être plus disponible.");
    } finally {
      setIsAccepting(false);
    }
  };

  if (!offer) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Offre non trouvée.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Accepter l'Offre</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.offerSummaryCard}>
          <Text style={styles.summaryTitle}>Résumé de l'offre</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Vendeur</Text>
            <Text style={styles.summaryValue}>User {offer.userId.substring(0, 6)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Vend</Text>
            <Text style={styles.summaryValueBold}>{offer.fromAmount.toLocaleString()} {offer.fromCurrency}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pour</Text>
            <Text style={styles.summaryValueBold}>{offer.toAmount.toLocaleString()} {offer.toCurrency}</Text>
          </View>
        </View>

        <View style={styles.balanceCheckCard}>
          <Text style={styles.summaryTitle}>Votre Solde</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Requis</Text>
            <Text style={styles.summaryValue}>{requiredAmount.toLocaleString()} {requiredCurrency}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Disponible</Text>
            <Text style={[styles.summaryValue, !hasSufficientFunds && styles.insufficientFunds]}>
              {userBalance.toLocaleString()} {requiredCurrency}
            </Text>
          </View>
          {!hasSufficientFunds && (
            <Text style={styles.fundsWarning}>Fonds insuffisants pour compléter cette transaction.</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.acceptButton, (!hasSufficientFunds || isAccepting) && styles.acceptButtonDisabled]}
          onPress={handleAcceptOffer}
          disabled={!hasSufficientFunds || isAccepting}
        >
          {isAccepting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.acceptButtonText}>Accepter et Échanger</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    flex: 1,
    marginLeft: -40,
  },
  content: {
    padding: 20,
  },
  offerSummaryCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
  },
  balanceCheckCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  summaryValueBold: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  insufficientFunds: {
    color: '#ef4444',
  },
  fundsWarning: {
    marginTop: 8,
    color: '#ef4444',
    textAlign: 'center',
    fontSize: 12,
  },
  acceptButton: {
    backgroundColor: '#22c55e',
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  acceptButtonDisabled: {
    backgroundColor: '#86efac',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
