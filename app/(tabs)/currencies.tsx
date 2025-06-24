"use client"

import { useState } from "react"
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { useMultiCurrency } from "@contexts/MultiCurrencyContext"

export default function CurrenciesScreen() {
  const {
    currencies,
    preferredCurrencies,
    baseCurrency,
    isLoading,
    addPreferredCurrency,
    removePreferredCurrency,
    setBaseCurrency,
    getCurrencyByCode,
    getRegionalCurrencies,
    getPopularCurrencies,
    refreshRates,
  } = useMultiCurrency()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRegion, setSelectedRegion] = useState<string>("all")
  const [refreshing, setRefreshing] = useState(false)

  const regions = [
    { key: "all", name: "Toutes", icon: "globe-outline" },
    { key: "west_africa", name: "Afrique de l'Ouest", icon: "location-outline" },
    { key: "east_africa", name: "Afrique de l'Est", icon: "location-outline" },
    { key: "central_africa", name: "Afrique Centrale", icon: "location-outline" },
    { key: "north_africa", name: "Afrique du Nord", icon: "location-outline" },
    { key: "southern_africa", name: "Afrique Australe", icon: "location-outline" },
  ]

  const onRefresh = async () => {
    setRefreshing(true)
    await refreshRates()
    setRefreshing(false)
  }

  const filteredCurrencies = currencies.filter((currency) => {
    const matchesSearch =
      currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      currency.country.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRegion = selectedRegion === "all" || currency.region === selectedRegion

    return matchesSearch && matchesRegion && currency.isActive
  })

  const handleTogglePreferred = (currencyCode: string) => {
    if (preferredCurrencies.includes(currencyCode)) {
      if (preferredCurrencies.length > 1) {
        removePreferredCurrency(currencyCode)
      } else {
        Alert.alert("Attention", "Vous devez avoir au moins une devise préférée")
      }
    } else {
      if (preferredCurrencies.length < 8) {
        addPreferredCurrency(currencyCode)
      } else {
        Alert.alert("Limite atteinte", "Vous ne pouvez avoir que 8 devises préférées maximum")
      }
    }
  }

  const handleSetBaseCurrency = (currencyCode: string) => {
    Alert.alert("Devise de base", `Définir ${currencyCode} comme devise de base ?`, [
      { text: "Annuler", style: "cancel" },
      { text: "Confirmer", onPress: () => setBaseCurrency(currencyCode) },
    ])
  }

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "up":
        return "trending-up"
      case "down":
        return "trending-down"
      default:
        return "remove"
    }
  }

  const getTrendColor = (trend?: string) => {
    switch (trend) {
      case "up":
        return "#10b981"
      case "down":
        return "#ef4444"
      default:
        return "#64748b"
    }
  }

  const getVolatilityColor = (volatility?: string) => {
    switch (volatility) {
      case "high":
        return "#ef4444"
      case "medium":
        return "#f59e0b"
      case "low":
        return "#10b981"
      default:
        return "#64748b"
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
          <Text style={styles.headerTitle}>Devises Africaines</Text>
          <Text style={styles.headerSubtitle}>{currencies.filter((c) => c.isActive).length} devises disponibles</Text>
        </LinearGradient>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une devise..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* Region Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.regionFilter}>
          {regions.map((region) => (
            <TouchableOpacity
              key={region.key}
              style={[styles.regionButton, selectedRegion === region.key && styles.regionButtonActive]}
              onPress={() => setSelectedRegion(region.key)}
            >
              <Ionicons
                name={region.icon as any}
                size={16}
                color={selectedRegion === region.key ? "#fff" : "#64748b"}
              />
              <Text style={[styles.regionText, selectedRegion === region.key && styles.regionTextActive]}>
                {region.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Base Currency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Devise de base</Text>
          <View style={styles.baseCurrencyCard}>
            <View style={styles.currencyInfo}>
              <Text style={styles.currencyFlag}>{getCurrencyByCode(baseCurrency)?.flag}</Text>
              <View style={styles.currencyDetails}>
                <Text style={styles.currencyCode}>{baseCurrency}</Text>
                <Text style={styles.currencyName}>{getCurrencyByCode(baseCurrency)?.name}</Text>
              </View>
            </View>
            <View style={styles.baseBadge}>
              <Text style={styles.baseBadgeText}>Base</Text>
            </View>
          </View>
        </View>

        {/* Preferred Currencies */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Devises préférées</Text>
            <Text style={styles.sectionSubtitle}>{preferredCurrencies.length}/8</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {preferredCurrencies.map((code) => {
              const currency = getCurrencyByCode(code)
              if (!currency) return null

              return (
                <View key={code} style={styles.preferredCurrencyCard}>
                  <TouchableOpacity style={styles.removePreferredButton} onPress={() => handleTogglePreferred(code)}>
                    <Ionicons name="close" size={16} color="#ef4444" />
                  </TouchableOpacity>
                  <Text style={styles.preferredFlag}>{currency.flag}</Text>
                  <Text style={styles.preferredCode}>{currency.code}</Text>
                  <Text style={styles.preferredName}>{currency.name}</Text>
                </View>
              )
            })}
          </ScrollView>
        </View>

        {/* Popular Currencies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Devises populaires</Text>
          {getPopularCurrencies().map((currency) => (
            <View key={currency.code} style={styles.currencyCard}>
              <View style={styles.currencyLeft}>
                <Text style={styles.currencyCardFlag}>{currency.flag}</Text>
                <View style={styles.currencyCardInfo}>
                  <View style={styles.currencyCardHeader}>
                    <Text style={styles.currencyCardCode}>{currency.code}</Text>
                    <View style={styles.currencyBadges}>
                      {currency.isPopular && (
                        <View style={styles.popularBadge}>
                          <Ionicons name="star" size={10} color="#f59e0b" />
                        </View>
                      )}
                      <View
                        style={[styles.volatilityBadge, { backgroundColor: getVolatilityColor(currency.volatility) }]}
                      >
                        <Text style={styles.volatilityText}>
                          {currency.volatility === "high" ? "H" : currency.volatility === "medium" ? "M" : "L"}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.currencyCardName}>{currency.name}</Text>
                  <Text style={styles.currencyCardCountry}>{currency.country}</Text>
                </View>
              </View>

              <View style={styles.currencyRight}>
                <View style={styles.trendContainer}>
                  <Ionicons
                    name={getTrendIcon(currency.trend) as any}
                    size={16}
                    color={getTrendColor(currency.trend)}
                  />
                </View>

                <View style={styles.currencyActions}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      preferredCurrencies.includes(currency.code) && styles.actionButtonActive,
                    ]}
                    onPress={() => handleTogglePreferred(currency.code)}
                  >
                    <Ionicons
                      name={preferredCurrencies.includes(currency.code) ? "heart" : "heart-outline"}
                      size={16}
                      color={preferredCurrencies.includes(currency.code) ? "#ef4444" : "#64748b"}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, baseCurrency === currency.code && styles.actionButtonActive]}
                    onPress={() => handleSetBaseCurrency(currency.code)}
                  >
                    <Ionicons
                      name={baseCurrency === currency.code ? "home" : "home-outline"}
                      size={16}
                      color={baseCurrency === currency.code ? "#667eea" : "#64748b"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* All Currencies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Toutes les devises {selectedRegion !== "all" && `- ${regions.find((r) => r.key === selectedRegion)?.name}`}
          </Text>
          {filteredCurrencies.map((currency) => (
            <View key={currency.code} style={styles.currencyCard}>
              <View style={styles.currencyLeft}>
                <Text style={styles.currencyCardFlag}>{currency.flag}</Text>
                <View style={styles.currencyCardInfo}>
                  <View style={styles.currencyCardHeader}>
                    <Text style={styles.currencyCardCode}>{currency.code}</Text>
                    <View style={styles.currencyBadges}>
                      {currency.isPopular && (
                        <View style={styles.popularBadge}>
                          <Ionicons name="star" size={10} color="#f59e0b" />
                        </View>
                      )}
                      <View
                        style={[styles.volatilityBadge, { backgroundColor: getVolatilityColor(currency.volatility) }]}
                      >
                        <Text style={styles.volatilityText}>
                          {currency.volatility === "high" ? "H" : currency.volatility === "medium" ? "M" : "L"}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Text style={styles.currencyCardName}>{currency.name}</Text>
                  <Text style={styles.currencyCardCountry}>{currency.country}</Text>
                </View>
              </View>

              <View style={styles.currencyRight}>
                <View style={styles.trendContainer}>
                  <Ionicons
                    name={getTrendIcon(currency.trend) as any}
                    size={16}
                    color={getTrendColor(currency.trend)}
                  />
                </View>

                <View style={styles.currencyActions}>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      preferredCurrencies.includes(currency.code) && styles.actionButtonActive,
                    ]}
                    onPress={() => handleTogglePreferred(currency.code)}
                  >
                    <Ionicons
                      name={preferredCurrencies.includes(currency.code) ? "heart" : "heart-outline"}
                      size={16}
                      color={preferredCurrencies.includes(currency.code) ? "#ef4444" : "#64748b"}
                    />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionButton, baseCurrency === currency.code && styles.actionButtonActive]}
                    onPress={() => handleSetBaseCurrency(currency.code)}
                  >
                    <Ionicons
                      name={baseCurrency === currency.code ? "home" : "home-outline"}
                      size={16}
                      color={baseCurrency === currency.code ? "#667eea" : "#64748b"}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>

        {filteredCurrencies.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="search-outline" size={64} color="#94a3b8" />
            <Text style={styles.emptyTitle}>Aucune devise trouvée</Text>
            <Text style={styles.emptyText}>Essayez de modifier vos critères de recherche</Text>
          </View>
        )}
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
    marginLeft: 10,
  },
  regionFilter: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  regionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#e1e5e9",
    gap: 5,
  },
  regionButtonActive: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  regionText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  regionTextActive: {
    color: "#fff",
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#64748b",
  },
  baseCurrencyCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#667eea",
  },
  currencyInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencyFlag: {
    fontSize: 32,
    marginRight: 15,
  },
  currencyDetails: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 5,
  },
  currencyName: {
    fontSize: 14,
    color: "#64748b",
  },
  baseBadge: {
    backgroundColor: "#667eea",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  baseBadgeText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  preferredCurrencyCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    alignItems: "center",
    minWidth: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    position: "relative",
  },
  removePreferredButton: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  preferredFlag: {
    fontSize: 24,
    marginBottom: 8,
  },
  preferredCode: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  preferredName: {
    fontSize: 10,
    color: "#64748b",
    textAlign: "center",
  },
  currencyCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currencyLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  currencyCardFlag: {
    fontSize: 24,
    marginRight: 15,
  },
  currencyCardInfo: {
    flex: 1,
  },
  currencyCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  currencyCardCode: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
  },
  currencyBadges: {
    flexDirection: "row",
    gap: 5,
  },
  popularBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
  },
  volatilityBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  volatilityText: {
    fontSize: 8,
    color: "#fff",
    fontWeight: "bold",
  },
  currencyCardName: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 2,
  },
  currencyCardCountry: {
    fontSize: 12,
    color: "#94a3b8",
  },
  currencyRight: {
    alignItems: "center",
    gap: 10,
  },
  trendContainer: {
    alignItems: "center",
  },
  currencyActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonActive: {
    backgroundColor: "#e8f2ff",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 20,
  },
})
