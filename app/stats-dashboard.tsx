import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { StatsCard } from "@/components/stats-card";
import { trpc } from "@/lib/trpc";

export default function StatsDashboardScreen() {
  const router = useRouter();
  const { data: trades = [], isLoading } = trpc.trades.list.useQuery();

  if (isLoading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  // Calculate statistics
  const totalTrades = trades.length;
  const winningTrades = trades.filter(
    (t) => parseFloat(t.pnl?.toString() || "0") > 0
  ).length;
  const losingTrades = trades.filter(
    (t) => parseFloat(t.pnl?.toString() || "0") < 0
  ).length;
  const breakEvenTrades = trades.filter(
    (t) => parseFloat(t.pnl?.toString() || "0") === 0
  ).length;

  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const lossRate = totalTrades > 0 ? (losingTrades / totalTrades) * 100 : 0;

  const totalPnl = trades.reduce(
    (sum, t) => sum + parseFloat(t.pnl?.toString() || "0"),
    0
  );
  const avgWin =
    winningTrades > 0
      ? trades
          .filter((t) => parseFloat(t.pnl?.toString() || "0") > 0)
          .reduce((sum, t) => sum + parseFloat(t.pnl?.toString() || "0"), 0) /
        winningTrades
      : 0;
  const avgLoss =
    losingTrades > 0
      ? Math.abs(
          trades
            .filter((t) => parseFloat(t.pnl?.toString() || "0") < 0)
            .reduce((sum, t) => sum + parseFloat(t.pnl?.toString() || "0"), 0) /
            losingTrades
        )
      : 0;

  const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0;

  // Calculate streaks
  let currentWinStreak = 0;
  let maxWinStreak = 0;
  let currentLossStreak = 0;
  let maxLossStreak = 0;

  trades.forEach((trade) => {
    const pnl = parseFloat(trade.pnl?.toString() || "0");
    if (pnl > 0) {
      currentWinStreak++;
      currentLossStreak = 0;
      maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
    } else if (pnl < 0) {
      currentLossStreak++;
      currentWinStreak = 0;
      maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
    }
  });

  // Best and worst trades
  const bestTrade = trades.reduce((best, trade) => {
    const tradePnl = parseFloat(trade.pnl?.toString() || "0");
    const bestPnl = parseFloat(best.pnl?.toString() || "0");
    return tradePnl > bestPnl ? trade : best;
  }, trades[0]);

  const worstTrade = trades.reduce((worst, trade) => {
    const tradePnl = parseFloat(trade.pnl?.toString() || "0");
    const worstPnl = parseFloat(worst.pnl?.toString() || "0");
    return tradePnl < worstPnl ? trade : worst;
  }, trades[0]);

  // Trades by symbol
  const tradesBySymbol: Record<string, number> = {};
  const pnlBySymbol: Record<string, number> = {};

  trades.forEach((trade) => {
    const symbol = trade.symbol;
    tradesBySymbol[symbol] = (tradesBySymbol[symbol] || 0) + 1;
    pnlBySymbol[symbol] =
      (pnlBySymbol[symbol] || 0) + parseFloat(trade.pnl?.toString() || "0");
  });

  const topSymbols = Object.entries(tradesBySymbol)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-bold text-foreground">
            Statistics
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary font-semibold">Close</Text>
          </TouchableOpacity>
        </View>

        {/* Overview */}
        <View className="bg-surface rounded-lg p-4 mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">
            Overview
          </Text>
          <View className="flex-row justify-between mb-4 gap-3">
            <StatsCard
              label="Total Trades"
              value={totalTrades.toString()}
            />
            <StatsCard
              label="Win Rate"
              value={`${winRate.toFixed(1)}%`}
              variant={winRate >= 50 ? "success" : "error"}
            />
          </View>
          <View className="flex-row justify-between gap-3">
            <StatsCard
              label="Total P&L"
              value={`₹${totalPnl.toFixed(2)}`}
              variant={totalPnl >= 0 ? "success" : "error"}
            />
            <StatsCard
              label="Profit Factor"
              value={profitFactor.toFixed(2)}
              variant={profitFactor >= 1.5 ? "success" : "default"}
            />
          </View>
        </View>

        {/* Trade Breakdown */}
        <View className="bg-surface rounded-lg p-4 mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">
            Trade Breakdown
          </Text>
          <View className="space-y-3">
            <View className="flex-row justify-between pb-3 border-b border-border">
              <Text className="text-sm text-muted">Winning Trades</Text>
              <Text className="text-sm font-bold text-success">
                {winningTrades}
              </Text>
            </View>
            <View className="flex-row justify-between pb-3 border-b border-border">
              <Text className="text-sm text-muted">Losing Trades</Text>
              <Text className="text-sm font-bold text-error">
                {losingTrades}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Break-Even Trades</Text>
              <Text className="text-sm font-bold text-foreground">
                {breakEvenTrades}
              </Text>
            </View>
          </View>
        </View>

        {/* Averages */}
        <View className="bg-surface rounded-lg p-4 mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">
            Averages
          </Text>
          <View className="space-y-3">
            <View className="flex-row justify-between pb-3 border-b border-border">
              <Text className="text-sm text-muted">Avg Winning Trade</Text>
              <Text className="text-sm font-bold text-success">
                ₹{avgWin.toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between pb-3 border-b border-border">
              <Text className="text-sm text-muted">Avg Losing Trade</Text>
              <Text className="text-sm font-bold text-error">
                ₹{avgLoss.toFixed(2)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Avg Trade P&L</Text>
              <Text
                className={`text-sm font-bold ${
                  totalPnl / totalTrades >= 0
                    ? "text-success"
                    : "text-error"
                }`}
              >
                ₹{(totalPnl / totalTrades).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Streaks */}
        <View className="bg-surface rounded-lg p-4 mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">
            Streaks
          </Text>
          <View className="space-y-3">
            <View className="flex-row justify-between pb-3 border-b border-border">
              <Text className="text-sm text-muted">Max Win Streak</Text>
              <Text className="text-sm font-bold text-success">
                {maxWinStreak}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Max Loss Streak</Text>
              <Text className="text-sm font-bold text-error">
                {maxLossStreak}
              </Text>
            </View>
          </View>
        </View>

        {/* Best & Worst Trades */}
        {bestTrade && (
          <View className="bg-surface rounded-lg p-4 mb-6">
            <Text className="text-lg font-bold text-foreground mb-3">
              Best Trade
            </Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-muted">{bestTrade.symbol}</Text>
              <Text className="text-sm font-bold text-success">
                ₹{parseFloat(bestTrade.pnl?.toString() || "0").toFixed(2)}
              </Text>
            </View>
            <Text className="text-xs text-muted">
              {new Date(bestTrade.entryDate).toLocaleDateString()} -{" "}
              {new Date(bestTrade.exitDate).toLocaleDateString()}
            </Text>
          </View>
        )}

        {worstTrade && (
          <View className="bg-surface rounded-lg p-4 mb-6">
            <Text className="text-lg font-bold text-foreground mb-3">
              Worst Trade
            </Text>
            <View className="flex-row justify-between mb-2">
              <Text className="text-sm text-muted">{worstTrade.symbol}</Text>
              <Text className="text-sm font-bold text-error">
                ₹{parseFloat(worstTrade.pnl?.toString() || "0").toFixed(2)}
              </Text>
            </View>
            <Text className="text-xs text-muted">
              {new Date(worstTrade.entryDate).toLocaleDateString()} -{" "}
              {new Date(worstTrade.exitDate).toLocaleDateString()}
            </Text>
          </View>
        )}

        {/* Advanced Analysis Buttons */}
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity
            onPress={() => router.push("/symbol-statistics")}
            className="flex-1 bg-surface border border-border rounded-lg p-4 items-center"
          >
            <Text className="text-2xl mb-2">📊</Text>
            <Text className="text-xs font-semibold text-foreground text-center">
              Symbol Stats
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/monthly-summary")}
            className="flex-1 bg-surface border border-border rounded-lg p-4 items-center"
          >
            <Text className="text-2xl mb-2">📅</Text>
            <Text className="text-xs font-semibold text-foreground text-center">
              Monthly Report
            </Text>
          </TouchableOpacity>
        </View>

        {/* Top Symbols */}
        {topSymbols.length > 0 && (
          <View className="bg-surface rounded-lg p-4 mb-8">
            <Text className="text-lg font-bold text-foreground mb-4">
              Top Symbols
            </Text>
            {topSymbols.map(([symbol, count]) => (
              <View
                key={symbol}
                className="flex-row justify-between pb-3 border-b border-border last:border-b-0"
              >
                <View>
                  <Text className="text-sm font-semibold text-foreground">
                    {symbol}
                  </Text>
                  <Text className="text-xs text-muted">{count} trades</Text>
                </View>
                <Text
                  className={`text-sm font-bold ${
                    (pnlBySymbol[symbol] || 0) >= 0
                      ? "text-success"
                      : "text-error"
                  }`}
                >
                  ₹{(pnlBySymbol[symbol] || 0).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
