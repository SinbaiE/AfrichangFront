import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function WalletDetailScreen() {
  const { currency } = useLocalSearchParams();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Wallet Details</Text>
      <Text style={styles.currency}>Currency: {currency}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  currency: {
    fontSize: 18,
  },
});
