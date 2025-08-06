import apiClient from "./apiClient";
import { API_ENDPOINTS } from "@/configuration/api";
import type { ExchangeOffer, ExchangeOrder, ExchangeRate } from "@/types";

/**
 * Service for handling exchange offers and orders.
 */
export const ExchangeService = {
  // === Exchange Offers ===

  createOffer: async (offerData: any): Promise<ExchangeOffer> => {
    return apiClient.post(API_ENDPOINTS.EXCHANGE_OFFERS, offerData);
  },

  getOpenOffers: async (): Promise<ExchangeOffer[]> => {
    return apiClient.get(API_ENDPOINTS.EXCHANGE_OFFERS);
  },

  getOffersByUser: async (userId: string): Promise<ExchangeOffer[]> => {
    return apiClient.get(API_ENDPOINTS.EXCHANGE_OFFERS_BY_USER(userId));
  },

  cancelOffer: async (offerId: string): Promise<void> => {
    return apiClient.delete(API_ENDPOINTS.CANCEL_EXCHANGE_OFFER(offerId));
  },

  // === Exchange Orders ===

  createOrder: async (orderData: any): Promise<ExchangeOrder> => {
    return apiClient.post(API_ENDPOINTS.EXCHANGE_ORDERS, orderData);
  },

  getOpenOrders: async (): Promise<ExchangeOrder[]> => {
    return apiClient.get(API_ENDPOINTS.EXCHANGE_ORDERS);
  },

  getOrdersByUser: async (userId: string): Promise<ExchangeOrder[]> => {
    return apiClient.get(API_ENDPOINTS.EXCHANGE_ORDERS_BY_USER(userId));
  },

  cancelOrder: async (orderId: string): Promise<void> => {
    return apiClient.delete(API_ENDPOINTS.CANCEL_EXCHANGE_ORDER(orderId));
  },

  // === Internal Exchange Rates ===

  getInternalRates: async (): Promise<ExchangeRate[]> => {
    return apiClient.get(API_ENDPOINTS.INTERNAL_EXCHANGE_RATES);
  },

  createInternalRate: async (rateData: any): Promise<ExchangeRate> => {
    return apiClient.post(API_ENDPOINTS.INTERNAL_EXCHANGE_RATES, rateData);
  },

  getSpecificRate: async (from: string, to: string): Promise<ExchangeRate> => {
    return apiClient.get(API_ENDPOINTS.GET_SPECIFIC_RATE(from, to));
  },

  executeExchange: async (params: { fromCurrency: string, toCurrency: string, amount: number }): Promise<Transaction> => {
    return apiClient.post(API_ENDPOINTS.EXECUTE_EXCHANGE, params);
  },
};
