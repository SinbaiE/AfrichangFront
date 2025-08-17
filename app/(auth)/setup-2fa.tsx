import { Setup2FA } from '@/components/auth/Setup2FA';
import { SafeAreaView, StyleSheet } from 'react-native';

export default function Setup2FAScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Setup2FA />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
