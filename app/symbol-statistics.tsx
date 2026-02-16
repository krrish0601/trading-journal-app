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

interface SymbolStats {
  symbol: string;
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

export default function SymbolStatisticsScreen() {
  const router = useRouter();
  const { data: trades = [] } = trpc.trades.list.useQuery();

  // Calculate statistics by symbol
  const calculateSymbolStats = (): SymbolStats[] => {
    const symbolMap: { [key: string]: SymbolStats } = {};

    trades.forEach((trade) => {
      const symbol = trade.symbol;
      const pnl = parseFloat(trade.pnl || "0");

      if (!symbolMap[symbol]) {
        symbolMap[symbol] = {
          symbol,
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

      symbolMap[symbol].trades += 1;
      symbolMap[symbol].totalPnl += pnl;
      symbolMap[symbol].bestTrade = Math.max(symbolMap[symbol].bestTrade, pnl);
      symbolMap[symbol].worstTrade = Math.min(symbolMap[symbol].worstTrade, pnl);

      if (pnl > 0) {
        symbolMap[symbol].wins += 1;
      } else if (pnl < 0) {
        symbolMap[symbol].losses += 1;
      }
    });

    // Calculate derived metrics
    Object.keys(symbolMap).forEach((symbol) => {
      const stats = symbolMap[symbol];
      if (stats.trades > 0) {
        stats.avgPnl = stats.totalPnl / stats.trades;
        stats.winRate = (stats.wins / stats.trades) * 100;

        // Calculate profit factor
        const totalWins = trades
          .filter((t) => t.symbol === symbol && parseFloat(t.pnl || "0") > 0)
          .reduce((sum, t) => sum + parseFloat(t.pnl || "0"), 0);
        const totalLosses = Math.abs(
          trades
            .filter((t) => t.symbol === symbol && parseFloat(t.pnl || "0") < 0)
            .reduce((sum, t) => sum + parseFloat(t.pnl || "0"), 0)
        );
        stats.profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;
      }
    });

    return Object.values(symbolMap).sort(
      (a, b) => b.totalPnl - a.totalPnl
    );
  };

  const symbolStats = calculateSymbolStats();
  const bestSymbol = symbolStats[0];
  const worstSymbol = symbolStats[symbolStats.length - 1];

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-bold text-foreground">
            Symbol Stats
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary font-semibold">Back</Text>
          </TouchableOpacity>
        </View>

        {symbolStats.length === 0 ? (
          <View className="bg-surface rounded-lg p-6 items-center">
            <Text className="text-lg font-bold text-foreground mb-2">
              No Data
            </Text>
            <Text className="text-sm text-muted text-center">
              Log some trades to see symbol-based statistics
            </Text>
          </View>
        ) : (
          <>
            {/* Best and Worst Symbols */}
            <View className="flex-row gap-3 mb-6">
              <View className="flex-1 bg-success/10 border border-success rounded-lg p-4">
                <Text className="text-xs text-success font-semibold mb-1">
                  BEST SYMBOL
                </Text>
                <Text className="text-lg font-bold text-success mb-2">
                  {bestSymbol?.symbol}
                </Text>
                <Text className="text-xs text-muted">
                  ₹{bestSymbol?.totalPnl.toFixed(2)} P&L
                </Text>
              </View>

              <View className="flex-1 bg-error/10 border border-error rounded-lg p-4">
                <Text className="text-xs text-error font-semibold mb-1">
                  WORST SYMBOL
                </Text>
                <Text className="text-lg font-bold text-error mb-2">
                  {worstSymbol?.symbol}
                </Text>
                <Text className="text-xs text-muted">
                  ₹{worstSymbol?.totalPnl.toFixed(2)} P&L
                </Text>
              </View>
            </View>

            {/* Symbol List */}
            <Text className="text-lg font-bold text-foreground mb-3">
              All Symbols
            </Text>
            <FlatList
              data={symbolStats}
              scrollEnabled={false}
              keyExtractor={(item) => item.symbol}
              renderItem={({ item }) => (
                <View className="bg-surface rounded-lg p-4 mb-3 border border-border">
                  <View className="flex-row justify-between items-start mb-3">
                    <View>
                      <Text className="text-base font-bold text-foreground">
                        {item.symbol}
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
                </View>
              )}
            />

            {/* Insights */}
            <View className="bg-primary/10 border border-primary rounded-lg p-4 mt-6 mb-6">
              <Text className="text-sm font-bold text-primary mb-2">
                💡 Insight
              </Text>
              <Text className="text-xs text-foreground leading-relaxed">
                {bestSymbol && bestSymbol.totalPnl > 0
                  ? `${bestSymbol.symbol} is your most profitable symbol with ${bestSymbol.winRate.toFixed(1)}% win rate. Focus on this symbol's patterns.`
                  : "Analyze which symbols give you the best results and focus your trading there."}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
