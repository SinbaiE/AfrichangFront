import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Dimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LineChart } from "react-native-chart-kit"
import { router } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"

const { width } = Dimensions.get("window")
console.log('cest mois la page')
export default function Dashboard() {
  const chartData = {
    labels: ["", "", "", "", "", ""],
    datasets: [
      {
        data: [20, 35, 25, 45, 35, 55, 65],
        color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  }

  const chartConfig = {
    backgroundColor: "#FFF8E1",
    backgroundGradientFrom: "#FFF8E1",
    backgroundGradientTo: "#FFF8E1",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 193, 7, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(0, 0, 0, 0)`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "4",
      strokeWidth: "0",
      fill: "#FFC107",
    },
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: "#E0E0E0",
      strokeOpacity: 0.3,
    },
    fillShadowGradient: "#FFE082",
    fillShadowGradientOpacity: 0.3,
    useShadowColorFromDataset: false,
  } 
  

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#667eea", "#764ba2"]}  style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoText}>🌍</Text>
          </View>
        </View>
        <Text style={styles.headerTitle}>AfriChange</Text>
        <TouchableOpacity style={styles.notificationButton} onPress={()=>router.push('/(tabs)/WalletScreen')}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Balance Section */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Solde du portefeuille actuel</Text>
          <View style={styles.balanceContainer}>
            <Text style={styles.balanceAmount}>120 000 FCFA</Text>
          </View>
        </View>

        {/* Statistics Section */}
        <View style={styles.statisticsSection}>
          <Text style={styles.statisticsTitle}>Statistiques des échanges</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={chartData}
              width={width - 80}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withHorizontalLabels={false}
              withVerticalLabels={false}
              withDots={true}
              withShadow={true}
              withInnerLines={true}
              withOuterLines={false}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton}  onPress={()=>router.push('/(admin)/dashboard')}>
            <Ionicons name="grid-outline" size={24} color="#333" />
            <Text style={styles.actionButtonText}>Tableau de{"\n"}bord</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}  onPress={()=> router.push('/(tabs)/transactions')}>
            <Ionicons name="swap-horizontal-outline" size={24} color="#333" />
            <Text style={styles.actionButtonText}>Échange</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="wallet-outline" size={24} color="#333" />
            <Text style={styles.actionButtonText}>Portefeuille</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="home" size={24} color="#FFC107" />
          <Text style={[styles.navText, styles.activeNavText]}>Tableau</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={()=>router.push('/(tabs)/exchange')}>
          <Ionicons name="swap-horizontal-outline" size={24} color="#666" />
          <Text style={styles.navText}>Échange</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={()=>router.push('/(tabs)/WalletScreen')}>
          <Ionicons name="wallet-outline" size={24} color="#666" />
          <Text style={styles.navText}>Portefeuille</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={()=>router.push('/(tabs)/profile')}>
          <Ionicons name="person-outline" size={24} color="#666" />
          <Text style={styles.navText}>Profil</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#764ba2",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  logoContainer: {
    width: 40,
  },
  logoIcon: {
    width: 40,
    height: 40,
    backgroundColor: "#FFF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
    textAlign: "center",
    marginLeft: -40,
  },
  notificationButton: {
    width: 40,
    height: 40,
    backgroundColor: "#FFF",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    backgroundColor: "#FFF8E1",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  balanceSection: {
    marginBottom: 30,
  },
  balanceLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  balanceContainer: {
    backgroundColor: "#764ba2",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 25,
    alignItems: "center",
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFF",
  },
  statisticsSection: {
    marginBottom: 30,
  },
  statisticsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
  },
  chartContainer: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 10,
    alignItems: "center",
  },
  chart: {
    borderRadius: 16,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    backgroundColor: "#FFC107",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 15,
    justifyContent: "space-around",
    marginBottom: 20,
  },
  actionButton: {
    alignItems: "center",
    flex: 1,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
    marginTop: 8,
    textAlign: "center",
    lineHeight: 16,
  },
  bottomNavigation: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent: "space-around",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
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
    color: "#FFC107",
    fontWeight: "600",
  },
})
