// Types principaux pour AfriChange
export interface User {
  id: string
  email: string
  phone: string
  firstName: string
  lastName: string
  country: string
  isVerified: boolean
  kycStatus: "pending" | "approved" | "rejected"
  createdAt: string
  avatar?: string | null
}

export interface Currency {
  code: string // 'XOF', 'NGN', 'GHS', etc.
  name: string // 'Franc CFA', 'Naira', 'Cedi'
  symbol: string // 'FCFA', '₦', '₵'
  country: string
  flag: string
  isActive: boolean
}

export interface Wallet {
  id: string
  userId: string
  currency: string // 'XOF', 'NGN', etc.
  balance: number
  isActive: boolean
  lastTransactionAt: string | null
}

export interface P2POffer {
  id: string;
  userId: string;
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  rate: number;
  status: 'open' | 'matched' | 'cancelled';
  matchedWith?: number;
  createdAt: string;
}

export interface TradeStats {
  totalTrades: number;
  totalVolume: number;
  averageRate: number;
  pnl: number;
  history: { date: string; value: number }[];
}

export interface ExchangeRate {
  from: string
  to: string
  rate: number
  spread: number
  lastUpdated: string
  trend: "up" | "down" | "stable"
}

export interface Transaction {
  id: string
  userId: string
  type: "exchange" | "deposit" | "withdrawal" | "transfer"
  fromCurrency: string
  toCurrency: string
  fromAmount: number
  toAmount: number
  rate: number
  fee: number
  status: "pending" | "completed" | "failed" | "cancelled"
  createdAt: string
  completedAt?: string
  reference: string
}

export interface KYCDocument {
  id: string
  userId: string
  type: "id_card" | "passport" | "selfie" | "proof_address"
  url: string
  status: "pending" | "approved" | "rejected"
  uploadedAt: string
  reviewedAt?: string
  rejectionReason?: string
}
