import { Tabs } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" }, // Hide default tab bar since we have custom navigation
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
    </Tabs>
  )
}
