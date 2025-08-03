import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { ExchangeService } from '@/services/ExchangeService';
import type { ExchangeOffer } from '@/types'; // Assuming a type for ExchangeOffer

export default function P2PMarketScreen() {
  const [offers, setOffers] = useState<ExchangeOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      // NOTE: Using getOpenOffers as a placeholder for a specific P2P offer listing endpoint.
      // The service might need a new method like `getOpenP2POffers()`.
      const fetchedOffers = await ExchangeService.getOpenOffers();
      setOffers(fetchedOffers);
    } catch (error) {
      console.error("Failed to fetch P2P offers:", error);
      // You might want to set an error state here and display it to the user
    } finally {
      setIsLoading(false);
    }
  };

  // useFocusEffect is used to refetch data every time the screen comes into view
  useFocusEffect(
    useCallback(() => {
      fetchOffers();
    }, [])
  );

  const renderOfferCard = ({ item }: { item: ExchangeOffer }) => {
    const rate = item.toAmount / item.fromAmount;

    return (
      <TouchableOpacity
        style={styles.offerCard}
        onPress={() => router.push({
          pathname: `/(p2p)/offer/${item.id}`,
          params: { offer: JSON.stringify(item) }
        })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.userName}>User {item.userId.substring(0, 6)}</Text>
          <View style={styles.rateContainer}>
            <Text style={styles.rateText}>1 {item.fromCurrency} ≈ {rate.toFixed(4)} {item.toCurrency}</Text>
          </View>
        </View>
        <View style={styles.cardBody}>
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>VEND</Text>
            <Text style={styles.amountValue}>{item.fromAmount.toLocaleString()} {item.fromCurrency}</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#6c63ff" style={styles.arrowIcon} />
          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>ACHÈTE</Text>
            <Text style={styles.amountValue}>{item.toAmount.toLocaleString()} {item.toCurrency}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Marché P2P</Text>
        <TouchableOpacity style={styles.createOfferButton} onPress={() => router.push('/(p2p)/create-offer')}>
          <Ionicons name="add" size={24} color="#fff" />
          <Text style={styles.createOfferButtonText}>Créer une offre</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#6c63ff" style={styles.loader} />
      ) : (
        <FlatList
          data={offers}
          renderItem={renderOfferCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="sad-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>Aucune offre P2P disponible pour le moment.</Text>
            </View>
          }
          onRefresh={fetchOffers}
          refreshing={isLoading}
        />
      )}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  createOfferButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6c63ff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  createOfferButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  offerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 8,
  },
  userName: {
    fontWeight: 'bold',
    color: '#333',
  },
  rateContainer: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rateText: {
    color: '#6c63ff',
    fontSize: 12,
    fontWeight: '500',
  },
  cardBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountContainer: {
    alignItems: 'center',
    flex: 1,
  },
  amountLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  arrowIcon: {
    marginHorizontal: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});
