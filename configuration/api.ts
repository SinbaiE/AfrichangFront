// Configuration API pour AfriChange

/**
 * The base URL for the API.
 *
 * --- IMPORTANT ---
 * To connect from a physical device or emulator, this URL must be the local IP address
 * of the machine running your backend server.
 *
 * It is highly recommended to use an environment variable for this.
 * Create a file named `.env` in the root of the project and add the following line:
 * EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:5000/api
 *
 * Then, restart the Expo development server.
 */
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://172.27.64.1:5000/api"

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: "/auth",
  REGISTER: "/users",
  PROFILE: "/auth/profile",
  LOGOUT: "/auth/logout",

  // Wallets
  WALLETS: "/wallets",
  CURRENCIES: "/currencies",

  // Transactions
  TRANSACTIONS: "/transactions",

  // Exchange
  EXCHANGE: "/exchange",
  EXECUTE_EXCHANGE: "/exchange/execute",
  EXCHANGE_RATES: "/exchange-rates",

  // Deposits & Withdrawals
  DEPOSITS: "/deposits",
  WITHDRAWALS: "/withdrawals",

  // KYC
  KYC_CREATE:"/submit",
  KYC: "/kyc",
  KYC_UPLOAD: "/kyc/upload",

  // Notifications
  NOTIFICATIONS: "/notifications",
  NOTIFICATIONS_REGISTER: "/notifications/register",

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
