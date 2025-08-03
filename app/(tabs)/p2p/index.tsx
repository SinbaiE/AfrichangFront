import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { P2PService } from '@/services/p2pService';
import type { P2POffer } from '@/types';

// Composant pour afficher une seule offre
const OfferCard = ({ offer, colors }: { offer: P2POffer, colors: any }) => {
  const toAmount = offer.amount / offer.rate;

  return (
    <View style={[styles.offerCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.offerHeader}>
        <View style={styles.currencyPill}>
          <Text style={styles.currencyPillText}>{offer.fromCurrency} → {offer.toCurrency}</Text>
        </View>
        <Text style={[styles.rate, { color: colors.textSecondary }]}>Taux: {offer.rate.toFixed(2)}</Text>
      </View>
      <View style={styles.offerBody}>
        <View>
          <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Montant à vendre</Text>
          <Text style={[styles.amountValue, { color: colors.text }]}>{offer.amount.toLocaleString()} {offer.fromCurrency}</Text>
        </View>
        <Ionicons name="arrow-forward-circle" size={24} color={colors.secondary} />
        <View style={{alignItems: 'flex-end'}}>
          <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Montant à recevoir</Text>
          <Text style={[styles.amountValue, { color: colors.text }]}>{toAmount.toLocaleString('fr-FR', {maximumFractionDigits: 2})} {offer.toCurrency}</Text>
        </View>
      </View>
      <TouchableOpacity style={[styles.acceptButton, { backgroundColor: colors.secondary }]}>
        <Text style={styles.acceptButtonText}>Accepter l'offre</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function P2PMarketScreen() {
  const { colors } = useTheme();
  const [offers, setOffers] = useState<P2POffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const fetchedOffers = await P2PService.getOpenOffers();
      setOffers(fetchedOffers);
    } catch (error) {
      console.error("Failed to fetch P2P offers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOffers();
    }, [])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Marché P2P</Text>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(tabs)/p2p/create')}
        >
          <Ionicons name="add" size={18} color={colors.earthBrown} />
          <Text style={[styles.createButtonText, { color: colors.earthBrown }]}>Créer une offre</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }}/>
      ) : (
        <FlatList
          data={offers}
          renderItem={({ item }) => <OfferCard offer={item} colors={colors} />}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          onRefresh={fetchOffers}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={{color: colors.textSecondary}}>Aucune offre disponible.</Text>
            </View>
          }
        />
      )}
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    marginLeft: 4,
    fontWeight: 'bold',
    fontSize: 14,
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  offerCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  offerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  currencyPill: {
    backgroundColor: '#FFC10720', // Light yellow
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currencyPillText: {
    color: '#FFC107',
    fontWeight: 'bold',
  },
  rate: {
    fontSize: 12,
  },
  offerBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  amountLabel: {
    fontSize: 12,
  },
  amountValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  acceptButton: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
