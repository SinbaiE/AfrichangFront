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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
          colors={[colors.primary, "#1E40AF"]}
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

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: colors.success }]}
            onPress={() => navigation.navigate("Deposit")}
          >
            <Ionicons name="add-circle" size={24} color="white" />
            <Text style={styles.quickActionText}>Déposer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: colors.warning }]}
            onPress={() => navigation.navigate("Withdraw")}
          >
            <Ionicons name="remove-circle" size={24} color="white" />
            <Text style={styles.quickActionText}>Retirer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate("Exchange")}
          >
            <Ionicons name="swap-horizontal" size={24} color="white" />
            <Text style={styles.quickActionText}>Échanger</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: colors.info }]}
            onPress={() => {}}
          >
            <Ionicons name="send" size={24} color="white" />
            <Text style={styles.quickActionText}>Envoyer</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Mes devises</Text>

          {wallets.length > 0 ? (
            <View style={styles.walletsList}>
              {wallets.map((wallet) => {
                const currencyInfo = getCurrencyInfo(wallet.currency.code)
                return (
                  <TouchableOpacity
                    key={wallet.id}
                    style={[styles.walletCard, { backgroundColor: colors.surface }]}
                    onPress={() => router.push(`/(tabs)/wallet/${wallet.currency.code}`)}
                  >
                    <View style={styles.walletHeader}>
                      <View style={styles.walletInfo}>
                        <Text style={styles.walletFlag}>{currencyInfo.flag}</Text>
                        <View style={styles.walletDetails}>
                          <Text style={[styles.walletCurrency, { color: colors.text }]}>{wallet.currency.code}</Text>
                          <Text style={[styles.walletName, { color: colors.textSecondary }]}>{currencyInfo.name}</Text>
                        </View>
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

                    <View style={styles.walletActions}>
                      <TouchableOpacity
                        style={[styles.walletActionButton, { borderColor: colors.border }]}
                        onPress={() => navigation.navigate("Deposit", { currency: wallet.currency.code })}
                      >
                        <Ionicons name="add" size={16} color={colors.primary} />
                        <Text style={[styles.walletActionText, { color: colors.primary }]}>Déposer</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.walletActionButton, { borderColor: colors.border }]}
                        onPress={() => navigation.navigate("Withdraw", { currency: wallet.currency.code })}
                      >
                        <Ionicons name="remove" size={16} color={colors.warning} />
                        <Text style={[styles.walletActionText, { color: colors.warning }]}>Retirer</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.walletActionButton, { borderColor: colors.border }]}
                        onPress={() => navigation.navigate("Exchange")}
                      >
                        <Ionicons name="swap-horizontal" size={16} color={colors.info} />
                        <Text style={[styles.walletActionText, { color: colors.info }]}>Échanger</Text>
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
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 32,
    justifyContent: "space-between",
  },
  quickActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  quickActionText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
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
    fontWeight: "600",
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
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  walletActionText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
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