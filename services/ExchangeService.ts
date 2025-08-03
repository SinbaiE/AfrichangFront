import apiClient from "./apiClient"
import { API_ENDPOINTS } from "@/configuration/api"
import type { ExchangeOffer, ExchangeOrder, ExchangeRate } from "@/types" // Assuming types exist

export const ExchangeService = {
  // === Exchange Offers ===

  createOffer: async (offerData: any): Promise<ExchangeOffer> => {
    const response = await apiClient.post(API_ENDPOINTS.EXCHANGE_OFFERS, offerData)
    return response.data
  },

  getOpenOffers: async (): Promise<ExchangeOffer[]> => {
    const response = await apiClient.get(API_ENDPOINTS.EXCHANGE_OFFERS)
    return response.data
  },

  getOffersByUser: async (userId: string): Promise<ExchangeOffer[]> => {
    const response = await apiClient.get(API_ENDPOINTS.EXCHANGE_OFFERS_BY_USER(userId))
    return response.data
  },

  cancelOffer: async (offerId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.CANCEL_EXCHANGE_OFFER(offerId))
  },

  // === Exchange Orders ===

  createOrder: async (orderData: any): Promise<ExchangeOrder> => {
    const response = await apiClient.post(API_ENDPOINTS.EXCHANGE_ORDERS, orderData)
    return response.data
  },

  getOpenOrders: async (): Promise<ExchangeOrder[]> => {
    const response = await apiClient.get(API_ENDPOINTS.EXCHANGE_ORDERS)
    return response.data
  },

  getOrdersByUser: async (userId: string): Promise<ExchangeOrder[]> => {
    const response = await apiClient.get(API_ENDPOINTS.EXCHANGE_ORDERS_BY_USER(userId))
    return response.data
  },

  cancelOrder: async (orderId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.CANCEL_EXCHANGE_ORDER(orderId))
  },

  // === Internal Exchange Rates ===

  getInternalRates: async (): Promise<ExchangeRate[]> => {
    const response = await apiClient.get(API_ENDPOINTS.INTERNAL_EXCHANGE_RATES)
    return response.data
  },

  createInternalRate: async (rateData: any): Promise<ExchangeRate> => {
    const response = await apiClient.post(API_ENDPOINTS.INTERNAL_EXCHANGE_RATES, rateData)
    return response.data
  },

  getSpecificRate: async (from: string, to: string): Promise<ExchangeRate> => {
    const response = await apiClient.get(API_ENDPOINTS.GET_SPECIFIC_RATE(from, to))
    return response.data
  },
}
