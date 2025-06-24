"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useMultiCurrency } from "@/contexts/MultiCurrencyContext"

interface CurrencyConverterProps {
  onConvert?: (amount: number, from: string, to: string, result: number) => void
  defaultFrom?: string
  defaultTo?: string
}

export default function CurrencyConverter({
  onConvert,
  defaultFrom = "XOF",
  defaultTo = "NGN",
}: CurrencyConverterProps) {
  const { currencies, convertAmount, getCurrencyByCode, preferredCurrencies } = useMultiCurrency()
  const [amount, setAmount] = useState("")
  const [fromCurrency, setFromCurrency] = useState(defaultFrom)
  const [toCurrency, setToCurrency] = useState(defaultTo)
  const [result, setResult] = useState<number | null>(null)

  const handleConvert = () => {
    const numAmount = Number.parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert("Erreur", "Veuillez entrer un montant valide")
      return
    }

    const convertedAmount = convertAmount(numAmount, fromCurrency, toCurrency)
    setResult(convertedAmount)
    onConvert?.(numAmount, fromCurrency, toCurrency, convertedAmount)
  }

  const handleSwapCurrencies = () => {
    const temp = fromCurrency
    setFromCurrency(toCurrency)
    setToCurrency(temp)
    setResult(null)
  }

  const availableCurrencies = currencies.filter((c) => preferredCurrencies.includes(c.code) && c.isActive)

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Convertisseur de devises</Text>

      {/* Amount Input */}
      <View style={styles.amountSection}>
        <Text style={styles.label}>Montant</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          placeholderTextColor="#94a3b8"
        />
      </View>

      {/* Currency Selection */}
      <View style={styles.currencySection}>
        <View style={styles.currencyRow}>
          <View style={styles.currencySelector}>
            <Text style={styles.label}>De</Text>
            <TouchableOpacity style={styles.currencyButton}>
              <Text style={styles.currencyFlag}>{getCurrencyByCode(fromCurrency)?.flag}</Text>
              <Text style={styles.currencyCode}>{fromCurrency}</Text>
              <Ionicons name="chevron-down" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.swapButton} onPress={handleSwapCurrencies}>
            <Ionicons name="swap-horizontal" size={20} color="#667eea" />
          </TouchableOpacity>

          <View style={styles.currencySelector}>
            <Text style={styles.label}>Vers</Text>
            <TouchableOpacity style={styles.currencyButton}>
              <Text style={styles.currencyFlag}>{getCurrencyByCode(toCurrency)?.flag}</Text>
              <Text style={styles.currencyCode}>{toCurrency}</Text>
              <Ionicons name="chevron-down" size={16} color="#64748b" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Convert Button */}
      <TouchableOpacity style={styles.convertButton} onPress={handleConvert}>
        <Text style={styles.convertButtonText}>Convertir</Text>
      </TouchableOpacity>

      {/* Result */}
      {result !== null && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>Résultat</Text>
          <Text style={styles.resultValue}>
            {result.toLocaleString()} {getCurrencyByCode(toCurrency)?.symbol}
          </Text>
          <Text style={styles.resultDetails}>
            {amount} {getCurrencyByCode(fromCurrency)?.symbol} = {result.toLocaleString()}{" "}
            {getCurrencyByCode(toCurrency)?.symbol}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 20,
    textAlign: "center",
  },
  amountSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  amountInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e1e5e9",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
  },
  currencySection: {
    marginBottom: 20,
  },
  currencyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  currencySelector: {
    flex: 1,
  },
  currencyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e1e5e9",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    gap: 8,
  },
  currencyFlag: {
    fontSize: 20,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
  },
  swapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 10,
  },
  convertButton: {
    backgroundColor: "#667eea",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  convertButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resultContainer: {
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  resultLabel: {
    fontSize: 14,
    color: "#16a34a",
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#16a34a",
    marginBottom: 8,
  },
  resultDetails: {
    fontSize: 12,
    color: "#16a34a",
    opacity: 0.8,
  },
})
