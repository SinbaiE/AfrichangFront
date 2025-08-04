// Configuration API pour AfriChange
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000/api/auth"

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  PROFILE: "/auth/profile",
  LOGOUT: "/auth/logout",

  // Wallets
  WALLETS: "/wallets",
  CURRENCIES: "/currencies",

  // Transactions
  TRANSACTIONS: "/transactions",

  // Exchange
  EXCHANGE: "/exchange",
  EXCHANGE_RATES: "/exchange-rates",

  // Deposits & Withdrawals
  DEPOSITS: "/deposits",
  WITHDRAWALS: "/withdrawals",

  // KYC
  KYC: "/kyc",
  KYC_UPLOAD: "/kyc/upload",

  // User Management
  USERS: "/users",
  USER_BY_ID: (id: string) => `/users/${id}`,

  // Settings & Profile
  USER_SETTINGS: "/settings",
  PROFILE_STATS: "/stats/profiles",
  EXPORT_USER_DATA: "/export",
  DELETE_USER_ACCOUNT: "/account",

  // Exchange Offers
  EXCHANGE_OFFERS: "/exchange-offers",
  EXCHANGE_OFFERS_BY_USER: (userId: string) => `/exchange-offers/user/${userId}`,
  CANCEL_EXCHANGE_OFFER: (id: string) => `/exchange-offers/${id}`,

  // Exchange Orders
  EXCHANGE_ORDERS: "/exchange-orders",
  EXCHANGE_ORDERS_BY_USER: (userId: string) => `/exchange-orders/user/${userId}`,
  CANCEL_EXCHANGE_ORDER: (id: string) => `/exchange-orders/${id}`,

  // Admin/Internal Exchange Rates
  INTERNAL_EXCHANGE_RATES: "/exchange-rates",
  GET_SPECIFIC_RATE: (from: string, to: string) => `/exchange-rates/${from}/${to}`,

  // Withdrawals
  WITHDRAWALS: "/withdrawals",
  WITHDRAWALS_BY_USER: (userId: string) => `/withdrawals/user/${userId}`,
  UPDATE_WITHDRAWAL_STATUS: (id: string) => `/withdrawals/${id}/status`,
}

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
}
