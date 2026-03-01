import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { StatsCard } from "@/components/stats-card";
import { trpc } from "@/lib/trpc";
import { useDeviceTrades } from "@/hooks/use-device-trades";
import { useState } from "react";

export default function SymbolFilterScreen() {
  const router = useRouter();
  const { data: trades = [], isLoading } = useDeviceTrades();
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  if (isLoading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  // Group trades by symbol
  const symbolStats: Record<
    string,
    {
      count: number;
      wins: number;
      losses: number;
      totalPnl: number;
      trades: typeof trades;
    }
  > = {};

  trades.forEach((trade) => {
    if (!symbolStats[trade.symbol]) {
      symbolStats[trade.symbol] = {
        count: 0,
        wins: 0,
        losses: 0,
        totalPnl: 0,
        trades: [],
      };
    }
    const pnl = parseFloat(trade.pnl?.toString() || "0");
    symbolStats[trade.symbol].count++;
    symbolStats[trade.symbol].totalPnl += pnl;
    symbolStats[trade.symbol].trades.push(trade);
    if (pnl > 0) symbolStats[trade.symbol].wins++;
    if (pnl < 0) symbolStats[trade.symbol].losses++;
  });

  const symbolList = Object.entries(symbolStats)
    .map(([symbol, stats]) => ({
      symbol,
      ...stats,
      winRate: (stats.wins / stats.count) * 100,
    }))
    .sort((a, b) => b.count - a.count);

  const selectedSymbolData =
    selectedSymbol && symbolStats[selectedSymbol]
      ? symbolStats[selectedSymbol]
      : null;

  if (selectedSymbolData) {
    const stats = symbolList.find((s) => s.symbol === selectedSymbol)!;

    return (
      <ScreenContainer className="p-4">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-bold text-foreground">
            {selectedSymbol}
          </Text>
          <TouchableOpacity onPress={() => setSelectedSymbol(null)}>
            <Text className="text-primary font-semibold">Back</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View className="bg-surface rounded-lg p-4 mb-6">
          <View className="flex-row justify-between gap-3 mb-4">
            <StatsCard
              label="Total Trades"
              value={stats.count.toString()}
            />
            <StatsCard
              label="Win Rate"
              value={`${stats.winRate.toFixed(1)}%`}
              variant={stats.winRate >= 50 ? "success" : "error"}
            />
          </View>
          <View className="flex-row justify-between gap-3">
            <StatsCard
              label="Total P&L"
              value={`₹${stats.totalPnl.toFixed(2)}`}
              variant={stats.totalPnl >= 0 ? "success" : "error"}
            />
            <StatsCard
              label="Avg Trade"
              value={`₹${(stats.totalPnl / stats.count).toFixed(2)}`}
              variant={stats.totalPnl / stats.count >= 0 ? "success" : "error"}
            />
          </View>
        </View>

        {/* Breakdown */}
        <View className="bg-surface rounded-lg p-4 mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">
            Breakdown
          </Text>
          <View className="space-y-3">
            <View className="flex-row justify-between pb-3 border-b border-border">
              <Text className="text-sm text-muted">Winning Trades</Text>
              <Text className="text-sm font-bold text-success">
                {stats.wins}
              </Text>
            </View>
            <View className="flex-row justify-between pb-3 border-b border-border">
              <Text className="text-sm text-muted">Losing Trades</Text>
              <Text className="text-sm font-bold text-error">
                {stats.losses}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Avg Winning Trade</Text>
              <Text className="text-sm font-bold text-success">
                ₹
                {(
                  selectedSymbolData.trades
                    .filter((t) => parseFloat(t.pnl?.toString() || "0") > 0)
                    .reduce(
                      (sum, t) => sum + parseFloat(t.pnl?.toString() || "0"),
                      0
                    ) / Math.max(stats.wins, 1)
                ).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Trades List */}
        <Text className="text-lg font-bold text-foreground mb-3">
          All Trades
        </Text>
        <FlatList
          data={selectedSymbolData.trades}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/trade-detail?id=${item.id}`)}
              className="bg-surface rounded-lg p-4 mb-3 flex-row justify-between items-center"
            >
              <View>
                <Text className="text-sm font-semibold text-foreground">
                  {new Date(item.entryDate).toLocaleDateString()}
                </Text>
                <Text className="text-xs text-muted">
                  {item.tradeType === "long" ? "📈" : "📉"} {item.tradeType}
                </Text>
              </View>
              <Text
                className={`text-lg font-bold ${
                  parseFloat(item.pnl?.toString() || "0") >= 0
                    ? "text-success"
                    : "text-error"
                }`}
              >
                ₹{parseFloat(item.pnl?.toString() || "0").toFixed(2)}
              </Text>
            </TouchableOpacity>
          )}
          scrollEnabled={false}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-3xl font-bold text-foreground">
          Symbols
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary font-semibold">Close</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {symbolList.map((symbol) => (
          <TouchableOpacity
            key={symbol.symbol}
            onPress={() => setSelectedSymbol(symbol.symbol)}
            className="bg-surface rounded-lg p-4 mb-3 flex-row justify-between items-center"
          >
            <View className="flex-1">
              <Text className="text-lg font-bold text-foreground">
                {symbol.symbol}
              </Text>
              <View className="flex-row gap-4 mt-2">
                <Text className="text-xs text-muted">
                  {symbol.count} trades
                </Text>
                <Text
                  className={`text-xs font-semibold ${
                    symbol.winRate >= 50 ? "text-success" : "text-error"
                  }`}
                >
                  {symbol.winRate.toFixed(1)}% win
                </Text>
              </View>
            </View>
            <View className="items-end">
              <Text
                className={`text-lg font-bold ${
                  symbol.totalPnl >= 0 ? "text-success" : "text-error"
                }`}
              >
                ₹{symbol.totalPnl.toFixed(2)}
              </Text>
              <Text className="text-xs text-muted">
                {symbol.totalPnl >= 0 ? "+" : ""}
                {(symbol.totalPnl / symbol.count).toFixed(2)} avg
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}
