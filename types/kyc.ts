export interface KYCStep {
  id: string
  title: string
  description: string
  isCompleted: boolean
  isActive: boolean
  icon: string
}

export interface PersonalInfo {
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  phoneNumber: string
  address: string
  city: string
  postalCode: string
  occupation: string
  monthlyIncome: string
}

export interface DocumentInfo {
  type: "national_id" | "passport" | "driving_license"
  number: string
  expiryDate: string
  issuingCountry: string
  frontImage?: string
  backImage?: string
}

export interface SelfieVerification {
  selfieImage?: string
  livenessCheck: boolean
  faceMatch: boolean
}

export interface KYCData {
  personalInfo: PersonalInfo
  documentInfo: DocumentInfo
  selfieVerification: SelfieVerification
  status: "not_started" | "in_progress" | "pending_review" | "approved" | "rejected"
  submittedAt?: string
  reviewedAt?: string
  rejectionReason?: string
}

export interface Country {
  code: string
  name: string
  flag: string
  documentTypes: string[]
}
