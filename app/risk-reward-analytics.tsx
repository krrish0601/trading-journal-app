import { View, Text, ScrollView, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useColors } from "@/hooks/use-colors";

export default function RiskRewardAnalyticsScreen() {
  const router = useRouter();
  const colors = useColors();
  const { data: trades = [] } = trpc.trades.list.useQuery();

  // Calculate risk-to-reward ratio for each trade
  const tradesWithRRR = trades.map((trade) => {
    const entryPrice = parseFloat(trade.entryPrice);
    const exitPrice = parseFloat(trade.exitPrice);
    const stoploss = trade.stoploss ? parseFloat(trade.stoploss) : entryPrice;
    const pnl = parseFloat(trade.pnl || "0");
    const qty = parseFloat(trade.quantity);

    // Risk = distance from entry to stoploss
    const risk = Math.abs(entryPrice - stoploss) * qty;
    // Reward = actual P&L
    const reward = Math.abs(pnl);
    // Risk-to-Reward Ratio
    const rrr = risk > 0 ? reward / risk : 0;

    // Breakeven calculation based on RRR
    // Breakeven = win rate needed to break even
    // Formula: Breakeven% = 1 / (1 + RRR)
    const breakeven = rrr > 0 ? (1 / (1 + rrr)) * 100 : 50;

    return {
      ...trade,
      risk,
      reward,
      rrr,
      breakeven,
    };
  });

  // Calculate overall portfolio metrics
  const totalRisk = tradesWithRRR.reduce((sum, t) => sum + t.risk, 0);
  const totalReward = tradesWithRRR.reduce((sum, t) => sum + t.reward, 0);
  const avgRRR = tradesWithRRR.length > 0 ? totalReward / (totalRisk || 1) : 0;
  const portfolioBreakeven = avgRRR > 0 ? (1 / (1 + avgRRR)) * 100 : 50;

  // Calculate win rate
  const winningTrades = tradesWithRRR.filter((t) => parseFloat(t.pnl || "0") > 0).length;
  const winRate = tradesWithRRR.length > 0 ? (winningTrades / tradesWithRRR.length) * 100 : 0;

  const renderTradeCard = ({ item }: { item: (typeof tradesWithRRR)[0] }) => (
    <TouchableOpacity
      onPress={() => router.push(`/trade-detail?id=${item.id}`)}
      className="bg-surface rounded-lg p-4 mb-3 border border-border"
    >
      <View className="flex-row justify-between items-start mb-3">
        <View>
          <Text className="text-lg font-bold text-foreground">{item.symbol}</Text>
          <Text className="text-xs text-muted">
            {new Date(item.entryDate).toLocaleDateString()}
          </Text>
        </View>
        <View className="items-end">
          <Text
            className={`text-lg font-bold ${
              parseFloat(item.pnl || "0") >= 0 ? "text-success" : "text-error"
            }`}
          >
            ₹{parseFloat(item.pnl || "0").toFixed(2)}
          </Text>
          <Text className="text-xs text-muted">{item.tradeType}</Text>
        </View>
      </View>

      {/* Risk-Reward Details Grid */}
      <View className="gap-2">
        <View className="flex-row gap-2">
          <View className="flex-1 bg-background rounded p-2">
            <Text className="text-xs text-muted mb-1">Risk</Text>
            <Text className="text-sm font-semibold text-foreground">
              ₹{item.risk.toFixed(2)}
            </Text>
          </View>
          <View className="flex-1 bg-background rounded p-2">
            <Text className="text-xs text-muted mb-1">Reward</Text>
            <Text className="text-sm font-semibold text-foreground">
              ₹{item.reward.toFixed(2)}
            </Text>
          </View>
        </View>
        <View className="flex-row gap-2">
          <View className="flex-1 bg-background rounded p-2">
            <Text className="text-xs text-muted mb-1">RRR</Text>
            <Text className="text-sm font-semibold text-primary">
              1:{item.rrr.toFixed(2)}
            </Text>
          </View>
          <View className="flex-1 bg-background rounded p-2">
            <Text className="text-xs text-muted mb-1">Breakeven</Text>
            <Text className="text-sm font-semibold text-foreground">
              {item.breakeven.toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-bold text-foreground">Risk-Reward</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary font-semibold">Back</Text>
          </TouchableOpacity>
        </View>

        {/* Portfolio Summary */}
        <View className="bg-surface rounded-lg p-4 mb-6 border border-border">
          <Text className="text-sm font-semibold text-foreground mb-4">Portfolio Summary</Text>

          <View className="gap-3">
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Total Trades</Text>
              <Text className="text-sm font-semibold text-foreground">{tradesWithRRR.length}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Win Rate</Text>
              <Text className="text-sm font-semibold text-success">{winRate.toFixed(1)}%</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Avg Risk-to-Reward</Text>
              <Text className="text-sm font-semibold text-primary">1:{avgRRR.toFixed(2)}</Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Portfolio Breakeven</Text>
              <Text className="text-sm font-semibold text-foreground">
                {portfolioBreakeven.toFixed(1)}%
              </Text>
            </View>

            <View className="border-t border-border pt-3 mt-3">
              <Text className="text-xs text-muted mb-2">
                Your win rate of {winRate.toFixed(1)}% is{" "}
                {winRate >= portfolioBreakeven ? "above" : "below"} the breakeven threshold of{" "}
                {portfolioBreakeven.toFixed(1)}%
              </Text>
              {winRate >= portfolioBreakeven ? (
                <Text className="text-xs text-success font-semibold">
                  ✓ Your strategy is profitable long-term
                </Text>
              ) : (
                <Text className="text-xs text-error font-semibold">
                  ✗ Improve win rate or RRR to be profitable
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Individual Trade Analysis */}
        <Text className="text-sm font-semibold text-foreground mb-3">Trade Details</Text>
        {tradesWithRRR.length > 0 ? (
          <FlatList
            data={tradesWithRRR}
            renderItem={renderTradeCard}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
          />
        ) : (
          <View className="bg-surface rounded-lg p-4 items-center justify-center">
            <Text className="text-sm text-muted">No trades yet</Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
