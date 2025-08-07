"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Platform } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { useKYC } from "@/contexts/KYCContext"
import type { PersonalInfo } from "@/types/kyc"
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

const countries = [
  { code: "SN", name: "Sénégal", flag: "🇸🇳" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "GH", name: "Ghana", flag: "🇬🇭" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "ML", name: "Mali", flag: "🇲🇱" },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫" },
]

const occupations = [
  "Étudiant(e)",
  "Employé(e)",
  "Entrepreneur",
  "Commerçant(e)",
  "Fonctionnaire",
  "Freelancer",
  "Retraité(e)",
  "Autre",
]

const incomeRanges = [
  "Moins de 100,000 FCFA",
  "100,000 - 300,000 FCFA",
  "300,000 - 500,000 FCFA",
  "500,000 - 1,000,000 FCFA",
  "Plus de 1,000,000 FCFA",
]

export default function PersonalInfoScreen() {
  const { kycData, updatePersonalInfo, nextStep } = useKYC()
  const [formData, setFormData] = useState<PersonalInfo>(kycData.personalInfo)
  const [errors, setErrors] = useState<Partial<PersonalInfo>>({})

  // State for the date picker
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [showCountryPicker, setShowCountryPicker] = useState(false)
  const [showOccupationPicker, setShowOccupationPicker] = useState(false)
  const [showIncomePicker, setShowIncomePicker] = useState(false)

  const onDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios'); // On iOS, the picker is a modal
    setDate(currentDate);

    if (event.type === "set") {
      const formattedDate = format(currentDate, 'yyyy-MM-dd');
      updateField("dateOfBirth", formattedDate);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<PersonalInfo> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Le prénom est requis"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Le nom est requis"
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "La date de naissance est requise"
    }

    if (!formData.nationality) {
      newErrors.nationality = "La nationalité est requise"
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Le numéro de téléphone est requis"
    } else if (!/^\+[1-9]\d{1,14}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Format de téléphone invalide"
    }

    if (!formData.address.trim()) {
      newErrors.address = "L'adresse est requise"
    }

    if (!formData.city.trim()) {
      newErrors.city = "La ville est requise"
    }

    if (!formData.occupation) {
      newErrors.occupation = "La profession est requise"
    }

    if (!formData.monthlyIncome) {
      newErrors.monthlyIncome = "Le revenu mensuel est requis"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      updatePersonalInfo(formData)
      nextStep()
      router.push("/(auth)/kyc/document-uplaod")
    }
  }

  const updateField = (field: keyof PersonalInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Informations personnelles</Text>
            <Text style={styles.headerSubtitle}>Étape 1 sur 4</Text>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: "25%" }]} />
          </View>
        </LinearGradient>

        <View style={styles.form}>
          {/* Nom et prénom */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Prénom *</Text>
              <TextInput
                style={[styles.input, errors.firstName && styles.inputError]}
                placeholder="Votre prénom"
                value={formData.firstName}
                onChangeText={(value) => updateField("firstName", value)}
                placeholderTextColor="#999"
              />
              {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.label}>Nom *</Text>
              <TextInput
                style={[styles.input, errors.lastName && styles.inputError]}
                placeholder="Votre nom"
                value={formData.lastName}
                onChangeText={(value) => updateField("lastName", value)}
                placeholderTextColor="#999"
              />
              {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}
            </View>
          </View>

          {/* Date de naissance */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date de naissance *</Text>
            <TouchableOpacity
              style={[styles.input, styles.dateInput, errors.dateOfBirth && styles.inputError]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={[styles.dateText, !formData.dateOfBirth && styles.placeholderText]}>
                {formData.dateOfBirth ? format(new Date(formData.dateOfBirth), 'dd/MM/yyyy') : "JJ/MM/AAAA"}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#64748b" />
            </TouchableOpacity>
            {errors.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
          </View>

          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="date"
              is24Hour={true}
              display="default"
              onChange={onDateChange}
              maximumDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18))} // User must be 18+
            />
          )}


          {/* Nationalité */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nationalité *</Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerInput, errors.nationality && styles.inputError]}
              onPress={() => setShowCountryPicker(true)}
            >
              <Text style={[styles.pickerText, !formData.nationality && styles.placeholderText]}>
                {formData.nationality
                  ? `${countries.find((c) => c.code === formData.nationality)?.flag} ${
                      countries.find((c) => c.code === formData.nationality)?.name
                    }`
                  : "Sélectionnez votre pays"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#64748b" />
            </TouchableOpacity>
            {errors.nationality && <Text style={styles.errorText}>{errors.nationality}</Text>}
          </View>

          {/* Téléphone */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Numéro de téléphone *</Text>
            <TextInput
              style={[styles.input, errors.phoneNumber && styles.inputError]}
              placeholder="+225 07 00 00 00"
              value={formData.phoneNumber}
              onChangeText={(value) => updateField("phoneNumber", value)}
              keyboardType="phone-pad"
              placeholderTextColor="#999"
            />
            {errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
          </View>

          {/* Adresse */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Adresse complète *</Text>
            <TextInput
              style={[styles.input, styles.textArea, errors.address && styles.inputError]}
              placeholder="Votre adresse complète"
              value={formData.address}
              onChangeText={(value) => updateField("address", value)}
              multiline
              numberOfLines={3}
              placeholderTextColor="#999"
            />
            {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
          </View>

          {/* Ville et code postal */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, { flex: 2, marginRight: 10 }]}>
              <Text style={styles.label}>Ville *</Text>
              <TextInput
                style={[styles.input, errors.city && styles.inputError]}
                placeholder="Votre ville"
                value={formData.city}
                onChangeText={(value) => updateField("city", value)}
                placeholderTextColor="#999"
              />
              {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}
            </View>

            <View style={[styles.inputContainer, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.label}>Code postal</Text>
              <TextInput
                style={styles.input}
                placeholder="00000"
                value={formData.postalCode}
                onChangeText={(value) => updateField("postalCode", value)}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          {/* Profession */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Profession *</Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerInput, errors.occupation && styles.inputError]}
              onPress={() => setShowOccupationPicker(true)}
            >
              <Text style={[styles.pickerText, !formData.occupation && styles.placeholderText]}>
                {formData.occupation || "Sélectionnez votre profession"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#64748b" />
            </TouchableOpacity>
            {errors.occupation && <Text style={styles.errorText}>{errors.occupation}</Text>}
          </View>

          {/* Revenu mensuel */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Revenu mensuel approximatif *</Text>
            <TouchableOpacity
              style={[styles.input, styles.pickerInput, errors.monthlyIncome && styles.inputError]}
              onPress={() => setShowIncomePicker(true)}
            >
              <Text style={[styles.pickerText, !formData.monthlyIncome && styles.placeholderText]}>
                {formData.monthlyIncome || "Sélectionnez votre tranche de revenus"}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#64748b" />
            </TouchableOpacity>
            {errors.monthlyIncome && <Text style={styles.errorText}>{errors.monthlyIncome}</Text>}
          </View>

          {/* Note de confidentialité */}
          <View style={styles.privacyNote}>
            <Ionicons name="shield-checkmark" size={20} color="#667eea" />
            <Text style={styles.privacyText}>
              Vos informations personnelles sont sécurisées et utilisées uniquement pour la vérification de votre
              identité conformément à nos politiques de confidentialité.
            </Text>
          </View>

          {/* Bouton suivant */}
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.nextButtonGradient}>
              <Text style={styles.nextButtonText}>Continuer</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Country Picker Modal */}
      {showCountryPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionnez votre pays</Text>
            <ScrollView>
              {countries.map((country) => (
                <TouchableOpacity
                  key={country.code}
                  style={styles.countryItem}
                  onPress={() => {
                    updateField("nationality", country.code)
                    setShowCountryPicker(false)
                  }}
                >
                  <Text style={styles.countryFlag}>{country.flag}</Text>
                  <Text style={styles.countryName}>{country.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowCountryPicker(false)}>
              <Text style={styles.modalCloseText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Occupation Picker Modal */}
      {showOccupationPicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionnez votre profession</Text>
            <ScrollView>
              {occupations.map((occupation) => (
                <TouchableOpacity
                  key={occupation}
                  style={styles.occupationItem}
                  onPress={() => {
                    updateField("occupation", occupation)
                    setShowOccupationPicker(false)
                  }}
                >
                  <Text style={styles.occupationText}>{occupation}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowOccupationPicker(false)}>
              <Text style={styles.modalCloseText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Income Picker Modal */}
      {showIncomePicker && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sélectionnez votre tranche de revenus</Text>
            <ScrollView>
              {incomeRanges.map((range) => (
                <TouchableOpacity
                  key={range}
                  style={styles.incomeItem}
                  onPress={() => {
                    updateField("monthlyIncome", range)
                    setShowIncomePicker(false)
                  }}
                >
                  <Text style={styles.incomeText}>{range}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowIncomePicker(false)}>
              <Text style={styles.modalCloseText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  headerContent: {
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#fff",
    borderRadius: 2,
  },
  form: {
    padding: 20,
  },
  row: {
    flexDirection: "row",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e1e5e9",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1e293b",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateText: {
    fontSize: 16,
    color: "#1e293b",
  },
  pickerInput: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pickerText: {
    fontSize: 16,
    color: "#1e293b",
  },
  placeholderText: {
    color: "#999",
  },
  errorText: {
    fontSize: 12,
    color: "#ef4444",
    marginTop: 5,
  },
  privacyNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#e8f2ff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 30,
  },
  privacyText: {
    fontSize: 12,
    color: "#667eea",
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
  nextButton: {
    borderRadius: 15,
    overflow: "hidden",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginRight: 10,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "70%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 20,
    textAlign: "center",
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  countryFlag: {
    fontSize: 20,
    marginRight: 15,
  },
  countryName: {
    fontSize: 16,
    color: "#1e293b",
  },
  occupationItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  occupationText: {
    fontSize: 16,
    color: "#1e293b",
  },
  incomeItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  incomeText: {
    fontSize: 16,
    color: "#1e293b",
  },
  modalCloseButton: {
    backgroundColor: "#667eea",
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 20,
  },
  modalCloseText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
})
