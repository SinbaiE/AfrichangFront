
import { Stack, SplashScreen } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from 'expo-font';
import { useEffect } from 'react';

import { AuthProvider } from "@contexts/AuthContext";
import { ThemeProvider } from "@contexts/ThemeContext";
import { WalletProvider } from "@contexts/WalletContext";
import { ExchangeProvider } from "@contexts/ExchangeContext";
import { NotificationProvider } from "@contexts/NotificationContext";
import { LocationProvider } from "@contexts/LocationContext";
import { KYCProvider } from "@contexts/KYCContext";
import { AnalyticsProvider } from "@contexts/AnalyticsContext";
import { BackupProvider } from "@contexts/BackupContext";
import { OfflineProvider } from "@contexts/OfflineContext";
import { MultiCurrencyProvider } from "@contexts/MultiCurrencyContext";
import { PerformanceProvider } from "@contexts/PerformanceContext";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    'SpaceMono-Regular': require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the splash screen after the fonts have loaded or an error occurred
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Prevent rendering until the font has loaded or an error was returned
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider>
        <AnalyticsProvider>
          <LocationProvider>
            <OfflineProvider>
              <BackupProvider>
                <NotificationProvider>
                  <MultiCurrencyProvider>
                    <PerformanceProvider>
                      <WalletProvider>
                        <ExchangeProvider>
                          <KYCProvider>
                            <StatusBar style="auto" />
                            <Stack screenOptions={{ headerShown: false }}>
                              <Stack.Screen name="(auth)" />
                              <Stack.Screen name="(tabs)" />
                              <Stack.Screen name="(admin)" />
                              <Stack.Screen name="(modals)" />
                            </Stack>
                          </KYCProvider>
                        </ExchangeProvider>
                      </WalletProvider>
                    </PerformanceProvider>
                  </MultiCurrencyProvider>
                </NotificationProvider>
              </BackupProvider>
            </OfflineProvider>
          </LocationProvider>
        </AnalyticsProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
