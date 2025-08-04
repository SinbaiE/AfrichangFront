import apiClient from './apiClient';
import { API_ENDPOINTS } from '@/configuration/api';
import type { P2POffer, TradeStats } from '@/types';

// Mock data to be used until the backend is connected
const MOCKED_OFFERS: P2POffer[] = [
  { id: '1', userId: 'user123', fromCurrency: 'XOF', toCurrency: 'NGN', amount: 50000, rate: 0.58, status: 'open', createdAt: new Date().toISOString() },
  { id: '2', userId: 'user456', fromCurrency: 'NGN', toCurrency: 'GHS', amount: 25000, rate: 12.5, status: 'open', createdAt: new Date().toISOString() },
  { id: '3', userId: 'user789', fromCurrency: 'GHS', toCurrency: 'XOF', amount: 1000, rate: 50.2, status: 'open', createdAt: new Date().toISOString() },
  { id: '4', userId: 'user101', fromCurrency: 'KES', toCurrency: 'ZAR', amount: 15000, rate: 1.5, status: 'open', createdAt: new Date().toISOString() },
];

const MOCKED_STATS: TradeStats = {
  totalTrades: 47,
  totalVolume: 1250000,
  averageRate: 0.59,
  pnl: 75000,
  history: [
    { date: '2023-01-01', value: 20000 },
    { date: '2023-02-01', value: 45000 },
    { date: '2023-03-01', value: 28000 },
    { date: '2023-04-01', value: 80000 },
    { date: '2023-05-01', value: 99000 },
    { date: '2023-06-01', value: 43000 },
  ],
};

type CreateOfferPayload = Omit<P2POffer, 'id' | 'userId' | 'status' | 'createdAt' | 'matchedWith'>;

/**
 * Service for Peer-to-Peer (P2P) trading.
 * NOTE: This service currently uses mocked data. The real API calls are commented out.
 */
export const P2PService = {
  /**
   * Fetches open P2P offers from the market.
   */
  getOpenOffers: async (): Promise<P2POffer[]> => {
    console.log('Fetching open P2P offers...');
    // Real implementation:
    // return await apiClient.get(API_ENDPOINTS.EXCHANGE_OFFERS);

    // Mock implementation:
    return new Promise(resolve => setTimeout(() => resolve(MOCKED_OFFERS), 1000));
  },

  /**
   * Creates a new P2P offer.
   * @param offerData - The data for the new offer.
   */
  createOffer: async (offerData: CreateOfferPayload): Promise<P2POffer> => {
    console.log('Creating P2P offer with data:', offerData);
    // Real implementation:
    // return await apiClient.post(API_ENDPOINTS.EXCHANGE_OFFERS, offerData);

    // Mock implementation:
    const newOffer: P2POffer = {
      ...offerData,
      id: Math.random().toString(),
      userId: 'current-user-id', // This would be set by the backend
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    return new Promise(resolve => setTimeout(() => resolve(newOffer), 1000));
  },

  /**
   * Accepts a P2P offer, creating an order.
   * @param offerId - The ID of the offer to accept.
   */
  acceptOffer: async (offerId: string): Promise<{ success: boolean }> => {
    console.log(`Accepting offer with ID: ${offerId}`);
    // Real implementation:
    // return await apiClient.post(API_ENDPOINTS.EXCHANGE_ORDERS, { offerId });

    // Mock implementation:
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000));
  },

  /**
   * Fetches personal P2P trading statistics.
   */
  getTradeStats: async (): Promise<TradeStats> => {
    console.log('Fetching trade stats...');
    // Real implementation:
    // const P2P_STATS_ENDPOINT = '/p2p/stats'; // Assuming an endpoint exists
    // return await apiClient.get(P2P_STATS_ENDPOINT);

    // Mock implementation:
    return new Promise(resolve => setTimeout(() => resolve(MOCKED_STATS), 1000));
  },
};
