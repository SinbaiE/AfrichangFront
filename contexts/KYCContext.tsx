"use client"
import { Ionicons } from "@expo/vector-icons"
import { createContext, useContext, useState, type ReactNode } from "react"
import type { KYCData, KYCStep, PersonalInfo, DocumentInfo, SelfieVerification } from "@/types/kyc"
import * as SecureStore from "expo-secure-store"

interface KYCContextType {
  kycData: KYCData
  currentStep: number
  steps: KYCStep[]
  isLoading: boolean
  updatePersonalInfo: (info: PersonalInfo) => void
  updateDocumentInfo: (info: DocumentInfo) => void
  updateSelfieVerification: (info: SelfieVerification) => void
  submitKYC: () => Promise<void>
  nextStep: () => void
  previousStep: () => void
  resetKYC: () => void
}

const KYCContext = createContext<KYCContextType | undefined>(undefined)

const initialSteps: KYCStep[] = [
  {
    id: "personal",
    title: "Informations personnelles",
    description: "Renseignez vos informations de base",
    isCompleted: false,
    isActive: true,
    icon: "person-outline",
  },
  {
    id: "document",
    title: "Document d'identité",
    description: "Téléchargez votre pièce d'identité",
    isCompleted: false,
    isActive: false,
    icon: "card-outline",
  },
  {
    id: "selfie",
    title: "Vérification biométrique",
    description: "Prenez un selfie pour vérifier votre identité",
    isCompleted: false,
    isActive: false,
    icon: "camera-outline",
  },
  {
    id: "review",
    title: "Révision",
    description: "Vérifiez vos informations avant soumission",
    isCompleted: false,
    isActive: false,
    icon: "checkmark-circle-outline",
  },
]

const initialKYCData: KYCData = {
  personalInfo: {
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    phoneNumber: "",
    address: "",
    city: "",
    postalCode: "",
    occupation: "",
    monthlyIncome: "",
  },
  documentInfo: {
    type: "national_id",
    number: "",
    expiryDate: "",
    issuingCountry: "",
  },
  selfieVerification: {
    livenessCheck: false,
    faceMatch: false,
  },
  status: "not_started",
}

export function KYCProvider({ children }: { children: ReactNode }) {
  const [kycData, setKycData] = useState<KYCData>(initialKYCData)
  const [currentStep, setCurrentStep] = useState(0)
  const [steps, setSteps] = useState<KYCStep[]>(initialSteps)
  const [isLoading, setIsLoading] = useState(false)

  const updatePersonalInfo = (info: PersonalInfo) => {
    setKycData((prev) => ({
      ...prev,
      personalInfo: info,
    }))
  }

  const updateDocumentInfo = (info: DocumentInfo) => {
    setKycData((prev) => ({
      ...prev,
      documentInfo: info,
    }))
  }

  const updateSelfieVerification = (info: SelfieVerification) => {
    setKycData((prev) => ({
      ...prev,
      selfieVerification: info,
    }))
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      const newSteps = [...steps]
      newSteps[currentStep].isCompleted = true
      newSteps[currentStep].isActive = false

      if (currentStep + 1 < steps.length) {
        newSteps[currentStep + 1].isActive = true
      }

      setSteps(newSteps)
      setCurrentStep(currentStep + 1)
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      const newSteps = [...steps]
      newSteps[currentStep].isActive = false
      newSteps[currentStep - 1].isActive = true
      newSteps[currentStep - 1].isCompleted = false

      setSteps(newSteps)
      setCurrentStep(currentStep - 1)
    }
  }

  const submitKYC = async () => {
    setIsLoading(true)
    try {
      const token = await SecureStore.getItemAsync("auth_token")
      const response = await fetch("/api/kyc/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(kycData),
      })

      if (response.ok) {
        setKycData((prev) => ({
          ...prev,
          status: "pending_review",
          submittedAt: new Date().toISOString(),
        }))
      }
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const resetKYC = () => {
    setKycData(initialKYCData)
    setCurrentStep(0)
    setSteps(initialSteps)
  }

  return (
    <KYCContext.Provider
      value={{
        kycData,
        currentStep,
        steps,
        isLoading,
        updatePersonalInfo,
        updateDocumentInfo,
        updateSelfieVerification,
        submitKYC,
        nextStep,
        previousStep,
        resetKYC,
      }}
    >
      {children}
    </KYCContext.Provider>
  )
}

export const useKYC = () => {
  const context = useContext(KYCContext)
  if (!context) {
    throw new Error("useKYC must be used within KYCProvider")
  }
  return context
}
