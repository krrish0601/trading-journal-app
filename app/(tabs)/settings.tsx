import { ScrollView, Text, View, TouchableOpacity, Switch } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useAuth } from "@/hooks/use-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useState } from "react";

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const colorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(colorScheme === "dark");

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text className="text-3xl font-bold text-foreground mb-6">
          Settings
        </Text>

        {/* User Section */}
        {isAuthenticated && user && (
          <View className="bg-surface rounded-lg p-4 mb-6">
            <Text className="text-sm text-muted mb-2">Signed In As</Text>
            <Text className="text-lg font-semibold text-foreground mb-1">
              {user.name || "Trader"}
            </Text>
            {user.email && (
              <Text className="text-sm text-muted">{user.email}</Text>
            )}
          </View>
        )}

        {/* Display Settings */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">
            Display
          </Text>

          <View className="bg-surface rounded-lg p-4">
            <View className="flex-row justify-between items-center pb-4 border-b border-border">
              <Text className="text-base text-foreground">Dark Mode</Text>
              <Switch
                value={isDarkMode}
                onValueChange={setIsDarkMode}
                trackColor={{ false: "#ccc", true: "#0a7ea4" }}
              />
            </View>

            <View className="flex-row justify-between items-center pt-4">
              <Text className="text-base text-foreground">Currency</Text>
              <Text className="text-base text-muted">USD ($)</Text>
            </View>
          </View>
        </View>

        {/* Data Settings */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">
            Data
          </Text>

          <View className="bg-surface rounded-lg overflow-hidden">
            <TouchableOpacity className="p-4 border-b border-border">
              <Text className="text-base text-foreground">Export Trades</Text>
              <Text className="text-sm text-muted mt-1">
                Download your trades as CSV
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="p-4">
              <Text className="text-base text-error">Clear All Data</Text>
              <Text className="text-sm text-muted mt-1">
                Delete all trades (cannot be undone)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* About Section */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">
            About
          </Text>

          <View className="bg-surface rounded-lg p-4">
            <View className="flex-row justify-between mb-4 pb-4 border-b border-border">
              <Text className="text-sm text-muted">App Version</Text>
              <Text className="text-sm font-semibold text-foreground">1.0.0</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Build</Text>
              <Text className="text-sm font-semibold text-foreground">
                2026.02.13
              </Text>
            </View>
          </View>
        </View>

        {/* Auth Section */}
        {isAuthenticated && (
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-error/10 rounded-lg p-4 items-center mb-8"
          >
            <Text className="text-base font-semibold text-error">
              Sign Out
            </Text>
          </TouchableOpacity>
        )}

        {/* Footer */}
        <View className="items-center py-4">
          <Text className="text-xs text-muted">
            Trading Journal App
          </Text>
          <Text className="text-xs text-muted mt-1">
            Track your trades and improve your performance
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
