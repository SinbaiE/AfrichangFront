import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useWallet } from '@/contexts/WalletContext';

const { width } = Dimensions.get("window");

export default function Dashboard() {
  const { wallets } = useWallet();

  // Re-using the balance calculation logic from WalletScreen
  const totalBalance = wallets.reduce((total, wallet) => {
    // This is a simplified conversion to a base currency (e.g., XOF)
    // In a real app, this would use real-time rates.
    const code = wallet.currency.code;
    if (code === "XOF") return total + wallet.balance;
    if (code === "NGN") return total + wallet.balance * 0.58; // Example rate
    if (code === "GHS") return total + wallet.balance * 50; // Example rate
    return total + wallet.balance;
  }, 0);

  // Dummy data for the chart
  const chartData = {
    labels: ["Jan", "Fev", "Mar", "Avr", "Mai", "Juin"],
    datasets: [{
      data: [20, 45, 28, 80, 99, 43],
      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
      strokeWidth: 2,
    }],
  };

  const chartConfig = {
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForDots: { r: "0" },
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <LinearGradient colors={["#6c63ff", "#483d8b"]} style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.headerTitle}>Tableau de Bord</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/notifications')}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceLabel}>Solde Total (estimé)</Text>
          <Text style={styles.balanceAmount}>{totalBalance.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={chartData}
              width={width}
              height={120}
              chartConfig={chartConfig}
              withVerticalLabels={false}
              withHorizontalLabels={false}
              withInnerLines={false}
              withOuterLines={false}
              bezier
              style={styles.chart}
            />
          </View>
        </LinearGradient>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(p2p)/market')}>
            <Ionicons name="people-outline" size={28} color="#6c63ff" />
            <Text style={styles.actionButtonText}>Échange P2P</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/exchange')}>
            <Ionicons name="swap-horizontal-outline" size={28} color="#6c63ff" />
            <Text style={styles.actionButtonText}>Marché</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/WalletScreen')}>
            <Ionicons name="wallet-outline" size={28} color="#6c63ff" />
            <Text style={styles.actionButtonText}>Portefeuilles</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/(tabs)/transactions')}>
            <Ionicons name="receipt-outline" size={28} color="#6c63ff" />
            <Text style={styles.actionButtonText}>Activité</Text>
          </TouchableOpacity>
        </View>

        {/* We keep the custom bottom navigation as it seems intended */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#6c63ff" />
          <Text style={[styles.navText, styles.activeNavText]}>Tableau</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(p2p)/market')}>
          <Ionicons name="people-outline" size={24} color="#666" />
          <Text style={styles.navText}>P2P</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/WalletScreen')}>
          <Ionicons name="wallet-outline" size={24} color="#666" />
          <Text style={styles.navText}>Portefeuille</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/(tabs)/profile')}>
          <Ionicons name="person-outline" size={24} color="#666" />
          <Text style={styles.navText}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },
  header: {
    padding: 20,
    paddingBottom: 0,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  balanceLabel: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  chartContainer: {
    marginLeft: -20, // To make chart span full width
  },
  chart: {
    paddingRight: 0,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 10,
    marginTop: -20, // Pull actions up slightly over the header gradient
    backgroundColor: '#f4f6f8',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  actionButton: {
    alignItems: "center",
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '45%',
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginTop: 8,
  },
  bottomSpacer: {
    height: 80, // Space for the fixed bottom nav
  },
  bottomNavigation: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: "center",
    flex: 1,
  },
  navText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  activeNavText: {
    color: "#6c63ff",
    fontWeight: "600",
  },
});
