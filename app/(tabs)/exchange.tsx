"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useWallet } from "@contexts/WalletContext"
import { useExchange } from "@contexts/ExchangeContext"

export default function ExchangeScreen() {
  const { wallets, currencies } = useWallet()
  const { getRate, calculateExchange, executeExchange, refreshRates } = useExchange()

  const [fromCurrency, setFromCurrency] = useState("XOF") // FCFA par défaut
  const [toCurrency, setToCurrency] = useState("NGN") // Naira par défaut
  const [amount, setAmount] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [exchangeResult, setExchangeResult] = useState<any>(null)

  useEffect(() => {
    if (amount && fromCurrency && toCurrency) {
      try {
        const result = calculateExchange(Number.parseFloat(amount), fromCurrency, toCurrency)
        setExchangeResult(result)
      } catch (error) {
        setExchangeResult(null)
      }
    } else {
      setExchangeResult(null)
    }
  }, [amount, fromCurrency, toCurrency])

  const handleSwapCurrencies = () => {
    const temp = fromCurrency
    setFromCurrency(toCurrency)
    setToCurrency(temp)
  }

  const handleExchange = async () => {
    if (!amount || !exchangeResult) {
      Alert.alert("Erreur", "Veuillez entrer un montant valide")
      return
    }

    setIsLoading(true)
    try {
      const transaction = await executeExchange({
        fromCurrency,
        toCurrency,
        amount: Number.parseFloat(amount),
      })

      Alert.alert(
        "Échange réussi !",
        `Vous avez échangé ${amount} ${fromCurrency} contre ${exchangeResult.toAmount.toFixed(2)} ${toCurrency}`,
        [{ text: "OK", onPress: () => setAmount("") }],
      )
    } catch (error: any) {
      Alert.alert("Erreur", error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrencyInfo = (code: string) => {
    return currencies.find((c) => c.code === code)
  }

  const currentRate = getRate(fromCurrency, toCurrency)

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
          <Text style={styles.headerTitle}>Échange de devises</Text>
          <Text style={styles.headerSubtitle}>Échangez vos devises africaines instantanément</Text>
        </LinearGradient>

        {/* Taux de change actuel */}
        {currentRate && (
          <View style={styles.rateCard}>
            <View style={styles.rateHeader}>
              <Ionicons name="trending-up" size={20} color="#4ade80" />
              <Text style={styles.rateTitle}>Taux actuel</Text>
              <TouchableOpacity onPress={refreshRates}>
                <Ionicons name="refresh" size={20} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Text style={styles.rateValue}>
              1 {fromCurrency} = {currentRate.rate.toFixed(4)} {toCurrency}
            </Text>
            <Text style={styles.rateTime}>Mis à jour {new Date(currentRate.lastUpdated).toLocaleTimeString()}</Text>
          </View>
        )}

        {/* Formulaire d'échange */}
        <View style={styles.exchangeForm}>
          {/* Devise source */}
          <View style={styles.currencySection}>
            <Text style={styles.sectionLabel}>Vous donnez</Text>
            <View style={styles.currencyInput}>
              <TouchableOpacity style={styles.currencySelector}>
                <Text style={styles.currencyFlag}>{getCurrencyInfo(fromCurrency)?.flag || "🌍"}</Text>
                <Text style={styles.currencyCode}>{fromCurrency}</Text>
                <Ionicons name="chevron-down" size={16} color="#64748b" />
              </TouchableOpacity>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
            <Text style={styles.balanceText}>
              Solde: {wallets.find((w) => w.currency.code === fromCurrency)?.balance?.toFixed(2) || "0.00"}{" "}
              {fromCurrency}
            </Text>
          </View>

          {/* Bouton d'échange */}
          <TouchableOpacity style={styles.swapButton} onPress={handleSwapCurrencies}>
            <Ionicons name="swap-vertical" size={24} color="#FFC107" />
          </TouchableOpacity>

          {/* Devise cible */}
          <View style={styles.currencySection}>
            <Text style={styles.sectionLabel}>Vous recevez</Text>
            <View style={styles.currencyInput}>
              <TouchableOpacity style={styles.currencySelector}>
                <Text style={styles.currencyFlag}>{getCurrencyInfo(toCurrency)?.flag || "🌍"}</Text>
                <Text style={styles.currencyCode}>{toCurrency}</Text>
                <Ionicons name="chevron-down" size={16} color="#64748b" />
              </TouchableOpacity>
              <Text style={styles.resultAmount}>{exchangeResult ? exchangeResult.toAmount.toFixed(2) : "0.00"}</Text>
            </View>
          </View>

          {/* Détails de l'échange */}
          {exchangeResult && (
            <View style={styles.exchangeDetails}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Taux de change</Text>
                <Text style={styles.detailValue}>
                  1 {fromCurrency} = {exchangeResult.rate.toFixed(4)} {toCurrency}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Frais</Text>
                <Text style={styles.detailValue}>
                  {exchangeResult.fee.toFixed(2)} {fromCurrency}
                </Text>
              </View>
              <View style={[styles.detailRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total à recevoir</Text>
                <Text style={styles.totalValue}>
                  {exchangeResult.toAmount.toFixed(2)} {toCurrency}
                </Text>
              </View>
            </View>
          )}

          {/* Bouton d'échange */}
          <TouchableOpacity
            style={[styles.exchangeButton, (!exchangeResult || isLoading) && styles.exchangeButtonDisabled]}
            onPress={handleExchange}
            disabled={!exchangeResult || isLoading}
          >
            <LinearGradient colors={["#FFC107", "#FF9800"]} style={styles.exchangeButtonGradient}>
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="swap-horizontal" size={20} color="#fff" />
                  <Text style={styles.exchangeButtonText}>Échanger maintenant</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Devises populaires */}
        <View style={styles.popularCurrencies}>
          <Text style={styles.popularTitle}>Devises populaires</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {currencies.slice(0, 6).map((currency) => (
              <TouchableOpacity key={currency.code} style={styles.currencyCard}>
                <Text style={styles.currencyCardFlag}>{currency.flag}</Text>
                <Text style={styles.currencyCardCode}>{currency.code}</Text>
                <Text style={styles.currencyCardName}>{currency.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },
  rateCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rateHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  rateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginLeft: 8,
    flex: 1,
  },
  rateValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 5,
  },
  rateTime: {
    fontSize: 12,
    color: "#64748b",
  },
  exchangeForm: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currencySection: {
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 10,
    fontWeight: "500",
  },
  currencyInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: "#e1e5e9",
  },
  currencySelector: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  currencyFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  currencyCode: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginRight: 5,
  },
  amountInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "right",
  },
  resultAmount: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "right",
  },
  balanceText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 5,
  },
  swapButton: {
    alignSelf: "center",
    backgroundColor: "#fff",
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: "#FFC107",
  },
  exchangeDetails: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  detailValue: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#e1e5e9",
    paddingTop: 8,
    marginTop: 8,
    marginBottom: 0,
  },
  totalLabel: {
    fontSize: 16,
    color: "#1e293b",
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 16,
    color: "#FFC107",
    fontWeight: "bold",
  },
  exchangeButton: {
    borderRadius: 15,
    overflow: "hidden",
  },
  exchangeButtonDisabled: {
    opacity: 0.6,
  },
  exchangeButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  exchangeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  popularCurrencies: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  popularTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 15,
  },
  currencyCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    alignItems: "center",
    minWidth: 80,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currencyCardFlag: {
    fontSize: 24,
    marginBottom: 5,
  },
  currencyCardCode: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 2,
  },
  currencyCardName: {
    fontSize: 10,
    color: "#64748b",
    textAlign: "center",
  },
})
