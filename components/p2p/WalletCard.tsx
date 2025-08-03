import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import type { Wallet } from '@/types';

interface WalletCardProps {
  wallet: Wallet;
}

const WalletCard: React.FC<WalletCardProps> = ({ wallet }) => {
  const { colors } = useTheme();

  // A simple way to get a representative icon/color per currency without a full map
  const getCurrencyVisuals = (currency: string) => {
    switch (currency) {
      case 'XOF':
      case 'XAF':
        return { icon: 'logo-bitcoin', color: '#f7931a' }; // Example
      case 'NGN':
        return { icon: 'logo-bitcoin', color: '#008000' }; // Example
      case 'GHS':
        return { icon: 'logo-bitcoin', color: '#eab308' }; // Example
      default:
        return { icon: 'wallet', color: colors.textSecondary };
    }
  };

  const visuals = getCurrencyVisuals(wallet.currency);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={[styles.iconContainer, { backgroundColor: visuals.color }]}>
        <Ionicons name={visuals.icon as any} size={24} color="#fff" />
      </View>
      <View style={styles.infoContainer}>
        <Text style={[styles.balance, { color: colors.text }]}>
          {wallet.balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
        </Text>
        <Text style={[styles.currency, { color: colors.textSecondary }]}>
          {wallet.currency}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  balance: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  currency: {
    fontSize: 14,
    marginTop: 2,
  },
});

export default WalletCard;
