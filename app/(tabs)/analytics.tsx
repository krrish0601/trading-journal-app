import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { StatsCard } from "@/components/stats-card";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

type TimePeriod = "weekly" | "monthly" | "yearly";

export default function AnalyticsScreen() {
  const { isAuthenticated } = useAuth();
  const [period, setPeriod] = useState<TimePeriod>("weekly");

  // Calculate date ranges based on period
  const getDateRange = (p: TimePeriod) => {
    const today = new Date();
    const startDate = new Date();

    switch (p) {
      case "weekly":
        startDate.setDate(today.getDate() - 7);
        break;
      case "monthly":
        startDate.setMonth(today.getMonth() - 1);
        break;
      case "yearly":
        startDate.setFullYear(today.getFullYear() - 1);
        break;
    }

    return { startDate, endDate: today };
  };

  const { startDate, endDate } = getDateRange(period);

  const { data: metrics, isLoading } = trpc.trades.getMetrics.useQuery(
    { startDate, endDate },
    { enabled: isAuthenticated }
  );

  if (!isAuthenticated) {
    return (
      <ScreenContainer className="justify-center items-center">
        <Text className="text-foreground">Please sign in to view analytics</Text>
      </ScreenContainer>
    );
  }

  if (isLoading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Text className="text-3xl font-bold text-foreground mb-2">
          Performance
        </Text>
        <Text className="text-sm text-muted mb-6">
          {period.charAt(0).toUpperCase() + period.slice(1)} Overview
        </Text>

        {/* Period Selector */}
        <View className="flex-row gap-2 mb-6">
          {["weekly", "monthly", "yearly"].map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p as TimePeriod)}
              className={`px-4 py-2 rounded-full ${
                period === p
                  ? "bg-primary"
                  : "bg-surface border border-border"
              }`}
            >
              <Text
                className={`font-semibold capitalize ${
                  period === p
                    ? "text-background"
                    : "text-foreground"
                }`}
              >
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Main Metrics */}
        <View className="mb-6">
          <View className="flex-row gap-3 mb-3">
            <StatsCard
              label="Total P&L"
              value={`$${(metrics?.totalPnl || 0).toFixed(2)}`}
              variant={
                (metrics?.totalPnl || 0) >= 0 ? "success" : "error"
              }
            />
            <StatsCard
              label="Trades"
              value={metrics?.totalTrades || 0}
              variant="default"
            />
          </View>

          <View className="flex-row gap-3">
            <StatsCard
              label="Win Rate"
              value={`${(metrics?.winRate || 0).toFixed(1)}%`}
              variant="success"
            />
            <StatsCard
              label="Profit Factor"
              value={(metrics?.profitFactor || 0).toFixed(2)}
              variant="default"
            />
          </View>
        </View>

        {/* Detailed Metrics */}
        <View className="bg-surface rounded-lg p-4 mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">
            Trade Breakdown
          </Text>

          <View className="space-y-3">
            <View className="flex-row justify-between pb-3 border-b border-border">
              <Text className="text-sm text-muted">Winning Trades</Text>
              <Text className="text-sm font-semibold text-success">
                {metrics?.winningTrades || 0}
              </Text>
            </View>

            <View className="flex-row justify-between pb-3 border-b border-border">
              <Text className="text-sm text-muted">Losing Trades</Text>
              <Text className="text-sm font-semibold text-error">
                {metrics?.losingTrades || 0}
              </Text>
            </View>

            <View className="flex-row justify-between pb-3 border-b border-border">
              <Text className="text-sm text-muted">Average Win</Text>
              <Text className="text-sm font-semibold text-success">
                ${(metrics?.averageWin || 0).toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Average Loss</Text>
              <Text className="text-sm font-semibold text-error">
                ${(metrics?.averageLoss || 0).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Meter/Gauge Visualization */}
        <View className="bg-surface rounded-lg p-4 mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">
            Performance Meter
          </Text>

          {/* Win Rate Meter */}
          <View className="mb-4">
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-muted">Win Rate</Text>
              <Text className="text-sm font-semibold text-foreground">
                {(metrics?.winRate || 0).toFixed(1)}%
              </Text>
            </View>
            <View className="h-2 bg-border rounded-full overflow-hidden">
              <View
                className="h-full bg-success"
                style={{
                  width: `${Math.min(metrics?.winRate || 0, 100)}%`,
                }}
              />
            </View>
          </View>

          {/* Profit Factor Meter */}
          <View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-muted">Profit Factor</Text>
              <Text className="text-sm font-semibold text-foreground">
                {(metrics?.profitFactor || 0).toFixed(2)}
              </Text>
            </View>
            <View className="h-2 bg-border rounded-full overflow-hidden">
              <View
                className="h-full bg-primary"
                style={{
                  width: `${Math.min((metrics?.profitFactor || 0) * 20, 100)}%`,
                }}
              />
            </View>
          </View>
        </View>

        {/* Summary Card */}
        {metrics && metrics.totalTrades > 0 ? (
          <View className="bg-primary/10 rounded-lg p-4 mb-8">
            <Text className="text-sm font-semibold text-primary mb-2">
              Summary
            </Text>
            <Text className="text-sm text-foreground leading-relaxed">
              You completed {metrics.totalTrades} trades with a {(metrics.winRate).toFixed(1)}% win rate. Your profit factor is {(metrics.profitFactor).toFixed(2)}, indicating {metrics.profitFactor > 1.5 ? "strong" : metrics.profitFactor > 1 ? "positive" : "challenging"} trading performance.
            </Text>
          </View>
        ) : (
          <View className="bg-surface rounded-lg p-4 mb-8 items-center">
            <Text className="text-sm text-muted">
              No trades in this period yet
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
