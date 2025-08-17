import { Verify2FA } from '@/components/auth/Verify2FA';
import { SafeAreaView, StyleSheet } from 'react-native';

export default function Verify2FAScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Verify2FA />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
