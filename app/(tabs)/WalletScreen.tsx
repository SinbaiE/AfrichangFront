"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { useTheme } from "@/contexts/ThemeContext"
import { useWallet } from "@/contexts/WalletContext"
import { router } from "expo-router"

const CURRENCY_INFO: { [key: string]: { name: string; symbol: string; flag: string } } = {
  XOF: { name: "Franc CFA (BCEAO)", symbol: "FCFA", flag: "🇸🇳" },
  XAF: { name: "Franc CFA (BEAC)", symbol: "FCFA", flag: "🇨🇲" },
  NGN: { name: "Naira Nigérian", symbol: "₦", flag: "🇳🇬" },
  GHS: { name: "Cedi Ghanéen", symbol: "GH₵", flag: "🇬🇭" },
  KES: { name: "Shilling Kenyan", symbol: "KSh", flag: "🇰🇪" },
  UGX: { name: "Shilling Ougandais", symbol: "USh", flag: "🇺🇬" },
  TZS: { name: "Shilling Tanzanien", symbol: "TSh", flag: "🇹🇿" },
  ZAR: { name: "Rand Sud-Africain", symbol: "R", flag: "🇿🇦" },
}

 const code = [
  {
    id: "1",
    currency: { code: "XOF" }, // Franc CFA BCEAO
    balance: 125000000
  },
  {
    id: "2",
    currency: { code: "USD" }, // Dollar US
    balance: 350.75
  },
  {
    id: "3",
    currency: { code: "EUR" }, // Euro
    balance: 980
  },
  {
    id: "4",
    currency: { code: "NGN" }, // Naira Nigérian
    balance: 120000
  }
];
export default function WalletScreen({ navigation }: any) {
  const { colors } = useTheme()
  const { wallets, refreshWallets, isLoading } = useWallet()
  const [refreshing, setRefreshing] = useState(false)

  const onRefresh = async () => {
    setRefreshing(true)
    await refreshWallets()
    setRefreshing(false)
  }

  const getTotalBalance = () => {
    return wallets.reduce((total, wallet) => {
      const code = wallet.currency.code
      if (code === "XOF") return total + wallet.balance
      if (code === "NGN") return total + wallet.balance * 0.5
      if (code === "GHS") return total + wallet.balance * 100
      return total + wallet.balance
    }, 0)
  }

  const getCurrencyInfo = (currencyCode: string) => {
    return (
      CURRENCY_INFO[currencyCode] || {
        name: currencyCode,
        symbol: currencyCode,
        flag: "💰",
      }
    )
  }

  

  return (
    <SafeAreaView style={[styles.container]}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Mon Portefeuille</Text>
          <TouchableOpacity>
            <Ionicons name="settings-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={["#667eea", "#764ba2"]}
          style={styles.totalBalanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.totalBalanceLabel}>Solde total équivalent</Text>
          <Text style={styles.totalBalanceAmount}>{getTotalBalance().toLocaleString("fr-FR")} FCFA</Text>
          <View style={styles.totalBalanceFooter}>
            <Text style={styles.totalBalanceSubtext}>
              {wallets.length} devise{wallets.length > 1 ? "s" : ""}
            </Text>
            <View style={styles.totalBalanceActions}>
              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("Deposit")}>
                <Ionicons name="add" size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate("Withdraw")}>
                <Ionicons name="remove" size={16} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Mes devises</Text>

          {code.length > 0 ? (
            <View style={styles.walletsList}>
              {code.map((wallet) => {
                const currencyInfo = getCurrencyInfo(wallet.currency.code)
                return (
                  <TouchableOpacity
                    key={wallet.id}
                    style={[styles.walletCard, { backgroundColor: colors.surface }]}
                    onPress={() => router.push(`/(tabs)/wallet/${wallet.currency.code}`)}
                  >
                    <View style={styles.walletHeader}>
                      <View style={styles.walletInfo}>
                        <Ionicons name="wallet-outline" size={34} color={colors.textSecondary} />
                        <View style={styles.walletDetails}>
                          <Text style={[styles.walletCurrency, { color: colors.text }]}>{wallet.currency.code }</Text>
                          <Text style={[styles.walletName, { color: colors.textSecondary }]}>{currencyInfo.name}</Text>
                        </View>
                        <View style={styles.walletBalance}>
                        <Text style={[styles.walletAmount, { color: colors.text }]}>
                          {wallet.balance.toLocaleString("fr-FR")}
                        </Text>
                        <Text style={[styles.walletSymbol, { color: colors.textSecondary }]}>
                          {currencyInfo.symbol}
                        </Text>
                      </View>
                      </View>
                    </View>

                    <View style={styles.walletActions}>
                      <TouchableOpacity
                        style={[styles.walletActionButton, { borderColor: colors.border }]}
                        onPress={() => navigation.navigate("Exchange")}
                      >
                       <Text style={styles.walletFlag}>{currencyInfo.flag}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.walletActionButton, { borderColor: colors.border }]}
                        onPress={() => navigation.navigate("Deposit", { currency: wallet.currency.code })}
                      >
                        <Ionicons name="add" size={16} color={colors.success} />
                        <Text style={[styles.walletActionText, { color: colors.success }]}>Déposer</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.walletActionButton, { borderColor: colors.border }]}
                        onPress={() => navigation.navigate("Withdraw", { currency: wallet.currency.code })}
                      >
                        <Ionicons name="remove" size={16} color={colors.error} />
                        <Text style={[styles.walletActionText, { color: colors.error }]}>Retirer</Text>
                      </TouchableOpacity>

                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
              <Ionicons name="wallet-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyStateTitle, { color: colors.text }]}>Aucun portefeuille</Text>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                Commencez par effectuer un dépôt pour créer votre premier portefeuille
              </Text>
              <TouchableOpacity
                style={[styles.emptyStateButton, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate("Deposit")}
              >
                <Text style={styles.emptyStateButtonText}>Effectuer un dépôt</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:"#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  totalBalanceCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
  },
  totalBalanceLabel: {
    color: "white",
    fontSize: 14,
    opacity: 0.9,
    marginBottom: 8,
  },
  totalBalanceAmount: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 16,
  },
  totalBalanceFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalBalanceSubtext: {
    color: "white",
    fontSize: 12,
    opacity: 0.8,
  },
  totalBalanceActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  walletsList: {
    gap: 16,
  },
  walletCard: {
    padding: 20,
    borderRadius: 16,
    // shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  walletHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  walletInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  walletFlag: {
    fontSize: 32,
    marginRight: 12,
  },
  walletDetails: {
    flex: 1,
  },
  walletCurrency: {
    fontSize: 18,
    fontWeight: "400",
    marginBottom: 4,
  },
  walletName: {
    fontSize: 14,
  },
  walletBalance: {
    alignItems: "flex-end",
  },
  walletAmount: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  walletSymbol: {
    fontSize: 12,
  },
  walletActions: {
    flexDirection: "row",
    gap: 8,
  },
  walletActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin:5,
    borderRadius: 8,
    borderWidth: 1,
  },
  walletActionText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
    color:"green",
  },
  emptyState: {
    padding: 40,
    borderRadius: 16,
    alignItems: "center",
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  emptyStateButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
})