import { FlatList, ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScreenContainer } from "@/components/screen-container";
import { TradeCard } from "@/components/trade-card";
import { StatsCard } from "@/components/stats-card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";

export default function HomeScreen() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const insets = useSafeAreaInsets();
  const [todayStats, setTodayStats] = useState({
    trades: 0,
    pnl: 0,
    wins: 0,
  });

  // Fetch trades
  const { data: trades = [], isLoading: tradesLoading, refetch } = trpc.trades.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Fetch today's metrics
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data: todayMetrics } = trpc.trades.getMetrics.useQuery(
    { startDate: today, endDate: tomorrow },
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    if (todayMetrics) {
      setTodayStats({
        trades: todayMetrics.totalTrades,
        pnl: todayMetrics.totalPnl,
        wins: todayMetrics.winningTrades,
      });
    }
  }, [todayMetrics]);

  if (authLoading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="justify-center items-center p-6">
        <Text className="text-2xl font-bold text-foreground mb-4 text-center">
          Welcome to Trading Journal
        </Text>
        <Text className="text-base text-muted text-center mb-8">
          Sign in to start tracking your trades and performance metrics.
        </Text>
        <TouchableOpacity className="bg-primary px-8 py-3 rounded-full">
          <Text className="text-background font-semibold">Sign In</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  const recentTrades = trades.slice(0, 5);
  const isLoading = tradesLoading;

  return (
    <ScreenContainer className="p-0">
      <FlatList
        data={recentTrades}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TradeCard
            trade={item}
            onPress={() => {
              // Navigate to trade detail - for now just show alert
            }}
          />
        )}
        ListHeaderComponent={
          <View className="p-4 pb-0">
            {/* Welcome Header */}
            <View className="mb-6">
              <Text className="text-3xl font-bold text-foreground">
                Dashboard
              </Text>
              <Text className="text-sm text-muted mt-1">
                Today's Performance
              </Text>
            </View>

            {/* Stats Cards */}
            <View className="flex-row gap-3 mb-6">
              <StatsCard
                label="Trades"
                value={todayStats.trades}
                variant="default"
              />
              <StatsCard
                label="P&L"
                value={`$${todayStats.pnl.toFixed(2)}`}
                variant={todayStats.pnl >= 0 ? "success" : "error"}
              />
              <StatsCard
                label="Wins"
                value={todayStats.wins}
                variant="success"
              />
            </View>

            {/* Recent Trades Header */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-foreground">
                Recent Trades
              </Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/trades")}>
                <Text className="text-primary font-semibold">View All</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="p-4 items-center justify-center py-12">
            {!isLoading && (
              <>
                <Text className="text-base text-muted mb-4">
                  No trades yet
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/trade-entry")}
                  className="bg-primary px-6 py-2 rounded-full"
                >
                  <Text className="text-background font-semibold">
                    Log Your First Trade
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        }
        ListFooterComponent={
          <View className="p-4 pb-8 flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push("/trade-entry")}
              className="flex-1 bg-primary py-3 rounded-lg items-center"
            >
              <Text className="text-background font-semibold">
                New Trade
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/analytics")}
              className="flex-1 bg-surface border border-border py-3 rounded-lg items-center"
            >
              <Text className="text-foreground font-semibold">
                Analytics
              </Text>
            </TouchableOpacity>
          </View>
        }
        scrollEnabled={true}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </ScreenContainer>
  );
}
