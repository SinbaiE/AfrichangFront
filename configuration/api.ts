// Configuration API pour AfriChange
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api"

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  PROFILE: "/auth/profile",
  LOGOUT: "/auth/logout",

  // Wallets
  WALLETS: "/wallets",

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
