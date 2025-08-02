"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { useTheme } from "@/contexts/ThemeContext"
import { useWallet } from "@/contexts/WalletContext"

interface WithdrawalMethod {
  id: string
  name: string
  icon: string
  type: "mobile_money" | "bank_transfer" | "cash_pickup"
  fees: number
  minAmount: number
  maxAmount: number
  processingTime: string
  available: boolean
}

const WITHDRAWAL_METHODS: WithdrawalMethod[] = [
  {
    id: "orange_money",
    name: "Orange Money",
    icon: "phone-portrait",
    type: "mobile_money",
    fees: 1.0,
    minAmount: 500,
    maxAmount: 500000,
    processingTime: "5-15 minutes",
    available: true,
  },
  {
    id: "mtn_money",
    name: "MTN Mobile Money",
    icon: "phone-portrait",
    type: "mobile_money",
    fees: 1.0,
    minAmount: 500,
    maxAmount: 500000,
    processingTime: "5-15 minutes",
    available: true,
  },
  {
    id: "wave",
    name: "Wave",
    icon: "phone-portrait",
    type: "mobile_money",
    fees: 0,
    minAmount: 100,
    maxAmount: 1000000,
    processingTime: "Instantané",
    available: true,
  },
  {
    id: "bank_transfer",
    name: "Virement bancaire",
    icon: "business",
    type: "bank_transfer",
    fees: 0.5,
    minAmount: 5000,
    maxAmount: 10000000,
    processingTime: "1-3 jours ouvrés",
    available: true,
  },
  {
    id: "cash_pickup",
    name: "Retrait en espèces",
    icon: "cash",
    type: "cash_pickup",
    fees: 2.0,
    minAmount: 1000,
    maxAmount: 200000,
    processingTime: "30 minutes",
    available: true,
  },
]

export default function WithdrawScreen({ navigation, route }: any) {
  const { colors } = useTheme()
  const { wallets, withdraw } = useWallet()

  const [selectedWallet, setSelectedWallet] = useState(
    route.params?.currency ? wallets.find((w) => w.currency === route.params.currency) || wallets[0] : wallets[0],
  )
  const [selectedMethod, setSelectedMethod] = useState<WithdrawalMethod | null>(null)
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [showWalletPicker, setShowWalletPicker] = useState(false)
  const [withdrawalDetails, setWithdrawalDetails] = useState({
    phoneNumber: "",
    accountNumber: "",
    accountName: "",
    bankName: "",
    pickupLocation: "",
    recipientName: "",
    recipientPhone: "",
  })

  const getCurrencyInfo = (currencyCode: string) => {
    const currencyMap: { [key: string]: { name: string; symbol: string; flag: string } } = {
      XOF: { name: "Franc CFA (BCEAO)", symbol: "FCFA", flag: "🇸🇳" },
      XAF: { name: "Franc CFA (BEAC)", symbol: "FCFA", flag: "🇨🇲" },
      NGN: { name: "Naira Nigérian", symbol: "₦", flag: "🇳🇬" },
      GHS: { name: "Cedi Ghanéen", symbol: "GH₵", flag: "🇬🇭" },
      KES: { name: "Shilling Kenyan", symbol: "KSh", flag: "🇰🇪" },
      UGX: { name: "Shilling Ougandais", symbol: "USh", flag: "🇺🇬" },
      TZS: { name: "Shilling Tanzanien", symbol: "TSh", flag: "🇹🇿" },
      ZAR: { name: "Rand Sud-Africain", symbol: "R", flag: "🇿🇦" },
    }
    return currencyMap[currencyCode] || { name: currencyCode, symbol: currencyCode, flag: "💰" }
  }

  const calculateFees = () => {
    if (!selectedMethod || !amount) return 0
    const amountNum = Number.parseFloat(amount)
    return (amountNum * selectedMethod.fees) / 100
  }

  const getNetAmount = () => {
    const amountNum = Number.parseFloat(amount) || 0
    const fees = calculateFees()
    return amountNum - fees
  }

  const validateAmount = () => {
    if (!selectedMethod || !amount || !selectedWallet) return false

    const amountNum = Number.parseFloat(amount)
    if (isNaN(amountNum)) return false

    return (
      amountNum >= selectedMethod.minAmount &&
      amountNum <= selectedMethod.maxAmount &&
      amountNum <= selectedWallet.balance
    )
  }

  const handleWithdraw = async () => {
    if (!validateAmount()) {
      if (Number.parseFloat(amount) > selectedWallet?.balance) {
        Alert.alert("Solde insuffisant", "Vous n'avez pas assez de fonds dans ce portefeuille")
      } else {
        Alert.alert(
          "Montant invalide",
          `Le montant doit être entre ${selectedMethod?.minAmount} et ${selectedMethod?.maxAmount} ${getCurrencyInfo(selectedWallet?.currency || "").symbol}`,
        )
      }
      return
    }

    if (!selectedMethod) {
      Alert.alert("Erreur", "Veuillez sélectionner un moyen de retrait")
      return
    }

    // Validation des détails de retrait
    if (selectedMethod.type === "mobile_money" && !withdrawalDetails.phoneNumber) {
      Alert.alert("Erreur", "Veuillez entrer votre numéro de téléphone")
      return
    }

    if (selectedMethod.type === "bank_transfer" && (!withdrawalDetails.accountNumber || !withdrawalDetails.bankName)) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs bancaires")
      return
    }

    if (
      selectedMethod.type === "cash_pickup" &&
      (!withdrawalDetails.pickupLocation || !withdrawalDetails.recipientName)
    ) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs de retrait")
      return
    }

    const currencyInfo = getCurrencyInfo(selectedWallet?.currency || "")

    Alert.alert(
      "Confirmer le retrait",
      `Retirer ${amount} ${currencyInfo.symbol} via ${selectedMethod.name}?\n\nFrais: ${calculateFees().toFixed(2)} ${currencyInfo.symbol}\nMontant net: ${getNetAmount().toFixed(2)} ${currencyInfo.symbol}`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Confirmer",
          onPress: async () => {
            try {
              setLoading(true)
              await withdraw(selectedWallet?.currency || "", Number.parseFloat(amount), selectedMethod.id)
              Alert.alert(
                "Retrait initié",
                `Votre retrait de ${amount} ${currencyInfo.symbol} a été initié. Vous recevrez une confirmation sous peu.`,
                [{ text: "OK", onPress: () => navigation.goBack() }],
              )
            } catch (error) {
              Alert.alert("Erreur", "Impossible d'effectuer le retrait. Veuillez réessayer.")
            } finally {
              setLoading(false)
            }
          },
        },
      ],
    )
  }

  const WithdrawalMethodCard = ({ method }: { method: WithdrawalMethod }) => (
    <TouchableOpacity
      style={[
        styles.methodCard,
        {
          backgroundColor: colors.surface,
          borderColor: selectedMethod?.id === method.id ? colors.primary : colors.border,
          borderWidth: selectedMethod?.id === method.id ? 2 : 1,
        },
      ]}
      onPress={() => setSelectedMethod(method)}
      disabled={!method.available}
    >
      <View style={styles.methodHeader}>
        <View style={styles.methodInfo}>
          <View style={[styles.methodIcon, { backgroundColor: colors.primary + "20" }]}>
            <Ionicons name={method.icon as any} size={24} color={colors.primary} />
          </View>
          <View style={styles.methodDetails}>
            <Text style={[styles.methodName, { color: colors.text }]}>{method.name}</Text>
            <Text style={[styles.methodTime, { color: colors.textSecondary }]}>{method.processingTime}</Text>
          </View>
        </View>
        {selectedMethod?.id === method.id && <Ionicons name="checkmark-circle" size={24} color={colors.primary} />}
      </View>

      <View style={styles.methodFooter}>
        <Text style={[styles.methodFees, { color: colors.textSecondary }]}>Frais: {method.fees}%</Text>
        <Text style={[styles.methodLimits, { color: colors.textSecondary }]}>
          {method.minAmount.toLocaleString()} - {method.maxAmount.toLocaleString()}{" "}
          {getCurrencyInfo(selectedWallet?.currency || "").symbol}
        </Text>
      </View>
    </TouchableOpacity>
  )

  const WithdrawalDetailsForm = () => {
    if (!selectedMethod) return null

    switch (selectedMethod.type) {
      case "mobile_money":
        return (
          <View style={[styles.detailsForm, { backgroundColor: colors.surface }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Détails Mobile Money</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Numéro de téléphone"
              placeholderTextColor={colors.textSecondary}
              value={withdrawalDetails.phoneNumber}
              onChangeText={(text) => setWithdrawalDetails({ ...withdrawalDetails, phoneNumber: text })}
              keyboardType="phone-pad"
            />
          </View>
        )

      case "bank_transfer":
        return (
          <View style={[styles.detailsForm, { backgroundColor: colors.surface }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Détails bancaires</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Nom de la banque"
              placeholderTextColor={colors.textSecondary}
              value={withdrawalDetails.bankName}
              onChangeText={(text) => setWithdrawalDetails({ ...withdrawalDetails, bankName: text })}
            />
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Numéro de compte"
              placeholderTextColor={colors.textSecondary}
              value={withdrawalDetails.accountNumber}
              onChangeText={(text) => setWithdrawalDetails({ ...withdrawalDetails, accountNumber: text })}
            />
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Nom du titulaire"
              placeholderTextColor={colors.textSecondary}
              value={withdrawalDetails.accountName}
              onChangeText={(text) => setWithdrawalDetails({ ...withdrawalDetails, accountName: text })}
            />
          </View>
        )

      case "cash_pickup":
        return (
          <View style={[styles.detailsForm, { backgroundColor: colors.surface }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Détails de retrait</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Lieu de retrait"
              placeholderTextColor={colors.textSecondary}
              value={withdrawalDetails.pickupLocation}
              onChangeText={(text) => setWithdrawalDetails({ ...withdrawalDetails, pickupLocation: text })}
            />
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Nom du bénéficiaire"
              placeholderTextColor={colors.textSecondary}
              value={withdrawalDetails.recipientName}
              onChangeText={(text) => setWithdrawalDetails({ ...withdrawalDetails, recipientName: text })}
            />
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Téléphone du bénéficiaire"
              placeholderTextColor={colors.textSecondary}
              value={withdrawalDetails.recipientPhone}
              onChangeText={(text) => setWithdrawalDetails({ ...withdrawalDetails, recipientPhone: text })}
              keyboardType="phone-pad"
            />
          </View>
        )

      default:
        return null
    }
  }

  if (!selectedWallet) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyState}>
          <Ionicons name="wallet-outline" size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyStateText, { color: colors.text }]}>Aucun portefeuille disponible</Text>
          <TouchableOpacity
            style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate("Deposit")}
          >
            <Text style={styles.emptyStateButtonText}>Effectuer un dépôt</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const currencyInfo = getCurrencyInfo(selectedWallet.currency)

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Effectuer un retrait</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Wallet Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Portefeuille</Text>
          <TouchableOpacity
            style={[styles.walletSelector, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowWalletPicker(true)}
          >
            <Text style={styles.walletFlag}>{currencyInfo.flag}</Text>
            <View style={styles.walletInfo}>
              <Text style={[styles.walletCurrency, { color: colors.text }]}>{selectedWallet.currency}</Text>
              <Text style={[styles.walletBalance, { color: colors.textSecondary }]}>
                Solde: {selectedWallet.balance.toLocaleString()} {currencyInfo.symbol}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Montant à retirer</Text>
          <View style={[styles.amountContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <TextInput
              style={[styles.amountInput, { color: colors.text }]}
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <Text style={[styles.currencySymbol, { color: colors.textSecondary }]}>{currencyInfo.symbol}</Text>
          </View>
          <Text style={[styles.balanceInfo, { color: colors.textSecondary }]}>
            Solde disponible: {selectedWallet.balance.toLocaleString()} {currencyInfo.symbol}
          </Text>
          {selectedMethod && (
            <Text style={[styles.amountLimits, { color: colors.textSecondary }]}>
              Limites: {selectedMethod.minAmount.toLocaleString()} - {selectedMethod.maxAmount.toLocaleString()}{" "}
              {currencyInfo.symbol}
            </Text>
          )}
        </View>

        {/* Withdrawal Methods */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Moyen de retrait</Text>
          {WITHDRAWAL_METHODS.map((method) => (
            <WithdrawalMethodCard key={method.id} method={method} />
          ))}
        </View>

        {/* Withdrawal Details Form */}
        {selectedMethod && <WithdrawalDetailsForm />}

        {/* Summary */}
        {selectedMethod && amount && validateAmount() && (
          <View style={[styles.summary, { backgroundColor: colors.surface }]}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>Récapitulatif</Text>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Montant demandé</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {Number.parseFloat(amount).toLocaleString()} {currencyInfo.symbol}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Frais</Text>
              <Text style={[styles.summaryValue, { color: colors.error }]}>
                -{calculateFees().toFixed(2)} {currencyInfo.symbol}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.summaryTotal]}>
              <Text style={[styles.summaryLabel, styles.totalLabel, { color: colors.text }]}>Montant net</Text>
              <Text style={[styles.summaryValue, styles.totalValue, { color: colors.success }]}>
                {getNetAmount().toFixed(2)} {currencyInfo.symbol}
              </Text>
            </View>
          </View>
        )}

        {/* Withdraw Button */}
        <TouchableOpacity
          style={[
            styles.withdrawButton,
            { backgroundColor: colors.warning },
            (!validateAmount() || !selectedMethod || loading) && { opacity: 0.5 },
          ]}
          onPress={handleWithdraw}
          disabled={!validateAmount() || !selectedMethod || loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Ionicons name="remove-circle" size={20} color="white" />
              <Text style={styles.withdrawButtonText}>Effectuer le retrait</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Wallet Picker Modal */}
      <Modal visible={showWalletPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Choisir un portefeuille</Text>
              <TouchableOpacity onPress={() => setShowWalletPicker(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {wallets.map((wallet) => {
                const info = getCurrencyInfo(wallet.currency)
                return (
                  <TouchableOpacity
                    key={wallet.id}
                    style={[
                      styles.walletOption,
                      selectedWallet?.id === wallet.id && { backgroundColor: colors.primary + "20" },
                    ]}
                    onPress={() => {
                      setSelectedWallet(wallet)
                      setShowWalletPicker(false)
                    }}
                  >
                    <Text style={styles.walletFlag}>{info.flag}</Text>
                    <View style={styles.walletInfo}>
                      <Text style={[styles.walletCurrency, { color: colors.text }]}>{wallet.currency}</Text>
                      <Text style={[styles.walletBalance, { color: colors.textSecondary }]}>
                        {wallet.balance.toLocaleString()} {info.symbol}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  walletSelector: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  walletFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  walletInfo: {
    flex: 1,
  },
  walletCurrency: {
    fontSize: 16,
    fontWeight: "600",
  },
  walletBalance: {
    fontSize: 14,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: "bold",
    paddingVertical: 16,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "500",
  },
  balanceInfo: {
    fontSize: 14,
    marginTop: 8,
  },
  amountLimits: {
    fontSize: 12,
    marginTop: 4,
  },
  methodCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  methodHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  methodInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  methodDetails: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  methodTime: {
    fontSize: 12,
  },
  methodFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  methodFees: {
    fontSize: 12,
  },
  methodLimits: {
    fontSize: 12,
  },
  detailsForm: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  summary: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  withdrawButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  withdrawButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  emptyStateButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  walletOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
})
