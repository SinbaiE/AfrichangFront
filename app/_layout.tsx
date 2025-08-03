import { Stack } from "expo-router"
import { StatusBar } from "expo-status-bar"
import { AuthProvider } from "@contexts/AuthContext"
import { WalletProvider } from "@contexts/WalletContext"
import { ExchangeProvider } from "@contexts/ExchangeContext"
import { NotificationProvider } from "@contexts/NotificationContext"
import { LocationProvider } from "@contexts/LocationContext"
import { KYCProvider } from "@contexts/KYCContext"
import { AnalyticsProvider } from "@contexts/AnalyticsContext"
import { BackupProvider } from "@contexts/BackupContext"
import { OfflineProvider } from "@contexts/OfflineContext"
import { MultiCurrencyProvider } from "@contexts/MultiCurrencyContext"
import { PerformanceProvider } from "@contexts/PerformanceContext"
import { ThemeProvider } from "@/contexts/ThemeContext"

export default function RootLayout() {
  return (
  <ThemeProvider>
      <AuthProvider>
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
      </AuthProvider>
    </ThemeProvider>
  )
}
