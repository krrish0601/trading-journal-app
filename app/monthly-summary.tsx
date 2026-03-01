import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useDeviceTrades } from "@/hooks/use-device-trades";
import { useState } from "react";

interface MonthlySummary {
  month: string;
  year: number;
  trades: number;
  wins: number;
  losses: number;
  totalPnl: number;
  avgPnl: number;
  winRate: number;
  bestTrade: number;
  worstTrade: number;
  profitFactor: number;
}

export default function MonthlySummaryScreen() {
  const router = useRouter();
  const { data: trades = [] } = useDeviceTrades();
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // Calculate monthly summaries
  const calculateMonthlySummaries = (): MonthlySummary[] => {
    const monthMap: { [key: string]: MonthlySummary } = {};

    trades.forEach((trade) => {
      const date = new Date(trade.entryDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthName = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      const pnl = parseFloat(trade.pnl || "0");

      if (!monthMap[monthKey]) {
        monthMap[monthKey] = {
          month: monthName,
          year: date.getFullYear(),
          trades: 0,
          wins: 0,
          losses: 0,
          totalPnl: 0,
          avgPnl: 0,
          winRate: 0,
          bestTrade: -Infinity,
          worstTrade: Infinity,
          profitFactor: 0,
        };
      }

      monthMap[monthKey].trades += 1;
      monthMap[monthKey].totalPnl += pnl;
      monthMap[monthKey].bestTrade = Math.max(monthMap[monthKey].bestTrade, pnl);
      monthMap[monthKey].worstTrade = Math.min(monthMap[monthKey].worstTrade, pnl);

      if (pnl > 0) {
        monthMap[monthKey].wins += 1;
      } else if (pnl < 0) {
        monthMap[monthKey].losses += 1;
      }
    });

    // Calculate derived metrics
    Object.keys(monthMap).forEach((monthKey) => {
      const summary = monthMap[monthKey];
      if (summary.trades > 0) {
        summary.avgPnl = summary.totalPnl / summary.trades;
        summary.winRate = (summary.wins / summary.trades) * 100;

        // Calculate profit factor
        const monthTrades = trades.filter((t) => {
          const date = new Date(t.entryDate);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          return key === monthKey;
        });

        const totalWins = monthTrades
          .filter((t) => parseFloat(t.pnl || "0") > 0)
          .reduce((sum, t) => sum + parseFloat(t.pnl || "0"), 0);
        const totalLosses = Math.abs(
          monthTrades
            .filter((t) => parseFloat(t.pnl || "0") < 0)
            .reduce((sum, t) => sum + parseFloat(t.pnl || "0"), 0)
        );
        summary.profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;
      }
    });

    return Object.values(monthMap).sort(
      (a, b) => new Date(b.month).getTime() - new Date(a.month).getTime()
    );
  };

  const monthlySummaries = calculateMonthlySummaries();
  const bestMonth = monthlySummaries.reduce((best, current) =>
    current.totalPnl > best.totalPnl ? current : best,
    monthlySummaries[0] || {
      month: "N/A",
      year: 0,
      trades: 0,
      wins: 0,
      losses: 0,
      totalPnl: 0,
      avgPnl: 0,
      winRate: 0,
      bestTrade: 0,
      worstTrade: 0,
      profitFactor: 0,
    }
  );

  const totalPnl = monthlySummaries.reduce((sum, m) => sum + m.totalPnl, 0);
  const totalTrades = monthlySummaries.reduce((sum, m) => sum + m.trades, 0);
  const totalWins = monthlySummaries.reduce((sum, m) => sum + m.wins, 0);
  const overallWinRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-bold text-foreground">
            Monthly Summary
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary font-semibold">Back</Text>
          </TouchableOpacity>
        </View>

        {monthlySummaries.length === 0 ? (
          <View className="bg-surface rounded-lg p-6 items-center">
            <Text className="text-lg font-bold text-foreground mb-2">
              No Data
            </Text>
            <Text className="text-sm text-muted text-center">
              Log some trades to see monthly summaries
            </Text>
          </View>
        ) : (
          <>
            {/* Overall Statistics */}
            <View className="bg-primary/10 border border-primary rounded-lg p-4 mb-6">
              <Text className="text-xs text-primary font-semibold mb-3">
                OVERALL PERFORMANCE
              </Text>
              <View className="flex-row gap-2 mb-3">
                <View className="flex-1">
                  <Text className="text-xs text-muted">Total P&L</Text>
                  <Text
                    className={`text-lg font-bold ${
                      totalPnl >= 0 ? "text-success" : "text-error"
                    }`}
                  >
                    {totalPnl >= 0 ? "+" : ""}₹{totalPnl.toFixed(2)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-muted">Total Trades</Text>
                  <Text className="text-lg font-bold text-foreground">
                    {totalTrades}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-xs text-muted">Win Rate</Text>
                  <Text className="text-lg font-bold text-foreground">
                    {overallWinRate.toFixed(1)}%
                  </Text>
                </View>
              </View>
            </View>

            {/* Best Month Highlight */}
            {bestMonth && bestMonth.totalPnl > 0 && (
              <View className="bg-success/10 border border-success rounded-lg p-4 mb-6">
                <Text className="text-xs text-success font-semibold mb-2">
                  BEST MONTH
                </Text>
                <View className="flex-row justify-between items-start">
                  <View>
                    <Text className="text-lg font-bold text-success">
                      {bestMonth.month}
                    </Text>
                    <Text className="text-xs text-muted">
                      {bestMonth.trades} trades
                    </Text>
                  </View>
                  <Text className="text-2xl font-bold text-success">
                    ₹{bestMonth.totalPnl.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}

            {/* Monthly List */}
            <Text className="text-lg font-bold text-foreground mb-3">
              Monthly Breakdown
            </Text>
            <FlatList
              data={monthlySummaries}
              scrollEnabled={false}
              keyExtractor={(item) => item.month}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() =>
                    setSelectedMonth(
                      selectedMonth === item.month ? null : item.month
                    )
                  }
                  className="bg-surface rounded-lg p-4 mb-3 border border-border"
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View>
                      <Text className="text-base font-bold text-foreground">
                        {item.month}
                      </Text>
                      <Text className="text-xs text-muted">
                        {item.trades} trades
                      </Text>
                    </View>
                    <Text
                      className={`text-lg font-bold ${
                        item.totalPnl >= 0 ? "text-success" : "text-error"
                      }`}
                    >
                      {item.totalPnl >= 0 ? "+" : ""}₹{item.totalPnl.toFixed(2)}
                    </Text>
                  </View>

                  {/* Metrics Grid */}
                  <View className="flex-row gap-2 mb-3">
                    <View className="flex-1 bg-background rounded p-2">
                      <Text className="text-xs text-muted">Win Rate</Text>
                      <Text className="text-sm font-bold text-foreground">
                        {item.winRate.toFixed(1)}%
                      </Text>
                    </View>
                    <View className="flex-1 bg-background rounded p-2">
                      <Text className="text-xs text-muted">Avg P&L</Text>
                      <Text
                        className={`text-sm font-bold ${
                          item.avgPnl >= 0 ? "text-success" : "text-error"
                        }`}
                      >
                        ₹{item.avgPnl.toFixed(2)}
                      </Text>
                    </View>
                    <View className="flex-1 bg-background rounded p-2">
                      <Text className="text-xs text-muted">W/L</Text>
                      <Text className="text-sm font-bold text-foreground">
                        {item.wins}/{item.losses}
                      </Text>
                    </View>
                  </View>

                  {/* Best/Worst Trades */}
                  <View className="flex-row gap-2">
                    <View className="flex-1 bg-success/10 rounded p-2">
                      <Text className="text-xs text-success">Best</Text>
                      <Text className="text-sm font-bold text-success">
                        ₹{item.bestTrade.toFixed(2)}
                      </Text>
                    </View>
                    <View className="flex-1 bg-error/10 rounded p-2">
                      <Text className="text-xs text-error">Worst</Text>
                      <Text className="text-sm font-bold text-error">
                        ₹{item.worstTrade.toFixed(2)}
                      </Text>
                    </View>
                    <View className="flex-1 bg-primary/10 rounded p-2">
                      <Text className="text-xs text-primary">Profit Factor</Text>
                      <Text className="text-sm font-bold text-primary">
                        {item.profitFactor === Infinity
                          ? "∞"
                          : item.profitFactor.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  {item.trades > 0 && (
                    <View className="mt-3 h-2 bg-background rounded-full overflow-hidden flex-row">
                      <View
                        style={{
                          width: `${(item.wins / item.trades) * 100}%`,
                        }}
                        className="bg-success"
                      />
                      <View
                        style={{
                          width: `${(item.losses / item.trades) * 100}%`,
                        }}
                        className="bg-error"
                      />
                    </View>
                  )}
                </TouchableOpacity>
              )}
            />

            {/* Insights */}
            <View className="bg-primary/10 border border-primary rounded-lg p-4 mt-6 mb-6">
              <Text className="text-sm font-bold text-primary mb-2">
                💡 Insights
              </Text>
              <Text className="text-xs text-foreground leading-relaxed">
                {bestMonth && bestMonth.totalPnl > 0
                  ? `${bestMonth.month} was your best month with ₹${bestMonth.totalPnl.toFixed(2)} profit. Analyze what strategies worked best during that period.`
                  : "Track your monthly performance to identify patterns and improve your trading consistency."}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
