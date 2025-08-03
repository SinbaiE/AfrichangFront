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
  avatar?: string
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
  currency: Currency
  balance: number
  isDefault: boolean
  createdAt: string
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

export interface ExchangeOffer {
  id: string;
  userId: string;
  fromCurrency: string;
  toCurrency: string;
  fromAmount: number;
  toAmount: number;
  rate: number;
  status: 'open' | 'closed' | 'cancelled';
  createdAt: string;
}

export interface ExchangeOrder {
  id: string;
  offerId: string;
  sellerId: string;
  buyerId: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}
