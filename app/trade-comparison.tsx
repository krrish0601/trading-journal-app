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

interface Trade {
  id: number;
  symbol: string;
  entryDate: Date;
  entryPrice: string;
  exitDate: Date;
  exitPrice: string;
  quantity: string;
  tradeType: "long" | "short";
  pnl: string | null;
  pnlPercent: string | null;
  notes: string | null;
}

export default function TradeComparisonScreen() {
  const router = useRouter();
  const { data: trades = [] } = useDeviceTrades();
  const [selectedTrades, setSelectedTrades] = useState<Trade[]>([]);

  const toggleTradeSelection = (trade: Trade) => {
    if (selectedTrades.find((t) => t.id === trade.id)) {
      setSelectedTrades(selectedTrades.filter((t) => t.id !== trade.id));
    } else if (selectedTrades.length < 2) {
      setSelectedTrades([...selectedTrades, trade]);
    }
  };

  const compareMetric = (
    trade1: Trade,
    trade2: Trade,
    metric: keyof Trade
  ) => {
    const val1 = trade1[metric];
    const val2 = trade2[metric];

    if (typeof val1 === "string" && typeof val2 === "string") {
      const num1 = parseFloat(val1);
      const num2 = parseFloat(val2);
      if (!isNaN(num1) && !isNaN(num2)) {
        return num1 > num2 ? 1 : num1 < num2 ? -1 : 0;
      }
    }
    return 0;
  };

  const renderComparisonRow = (label: string, value1: string, value2: string) => {
    return (
      <View className="flex-row mb-2">
        <View className="flex-1 bg-surface rounded-lg p-3">
          <Text className="text-xs text-muted mb-1">{label}</Text>
          <Text className="text-sm font-bold text-foreground">{value1}</Text>
        </View>
        <View className="w-2" />
        <View className="flex-1 bg-surface rounded-lg p-3">
          <Text className="text-xs text-muted mb-1">{label}</Text>
          <Text className="text-sm font-bold text-foreground">{value2}</Text>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-bold text-foreground">
            Compare Trades
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary font-semibold">Back</Text>
          </TouchableOpacity>
        </View>

        {selectedTrades.length === 0 ? (
          <View className="bg-surface rounded-lg p-6 items-center mb-6">
            <Text className="text-lg font-bold text-foreground mb-2">
              Select 2 Trades
            </Text>
            <Text className="text-sm text-muted text-center">
              Choose two trades below to compare side-by-side and identify differences
            </Text>
          </View>
        ) : (
          <View className="bg-primary/10 border border-primary rounded-lg p-4 mb-6">
            <Text className="text-sm font-bold text-primary">
              {selectedTrades.length}/2 trades selected
            </Text>
            {selectedTrades.length === 2 && (
              <Text className="text-xs text-foreground mt-1">
                Ready to compare
              </Text>
            )}
          </View>
        )}

        {/* Comparison View */}
        {selectedTrades.length === 2 && (
          <View className="mb-6">
            <Text className="text-lg font-bold text-foreground mb-4">
              Comparison
            </Text>

            {/* P&L Comparison */}
            <View className="bg-surface rounded-lg p-4 mb-4 border border-border">
              <Text className="text-sm font-bold text-foreground mb-3">
                Profitability
              </Text>
              {renderComparisonRow(
                "P&L",
                `₹${selectedTrades[0].pnl || "0"}`,
                `₹${selectedTrades[1].pnl || "0"}`
              )}
              {renderComparisonRow(
                "P&L %",
                `${selectedTrades[0].pnlPercent || "0"}%`,
                `${selectedTrades[1].pnlPercent || "0"}%`
              )}
            </View>

            {/* Trade Details Comparison */}
            <View className="bg-surface rounded-lg p-4 mb-4 border border-border">
              <Text className="text-sm font-bold text-foreground mb-3">
                Trade Details
              </Text>
              {renderComparisonRow(
                "Symbol",
                selectedTrades[0].symbol,
                selectedTrades[1].symbol
              )}
              {renderComparisonRow(
                "Type",
                selectedTrades[0].tradeType,
                selectedTrades[1].tradeType
              )}
              {renderComparisonRow(
                "Entry Price",
                `₹${selectedTrades[0].entryPrice}`,
                `₹${selectedTrades[1].entryPrice}`
              )}
              {renderComparisonRow(
                "Exit Price",
                `₹${selectedTrades[0].exitPrice}`,
                `₹${selectedTrades[1].exitPrice}`
              )}
              {renderComparisonRow(
                "Quantity",
                selectedTrades[0].quantity,
                selectedTrades[1].quantity
              )}
            </View>

            {/* Risk/Reward Comparison */}
            <View className="bg-surface rounded-lg p-4 mb-4 border border-border">
              <Text className="text-sm font-bold text-foreground mb-3">
                Risk Analysis
              </Text>
              {(() => {
                const trade1Risk = Math.abs(
                  parseFloat(selectedTrades[0].entryPrice) -
                    parseFloat(selectedTrades[0].exitPrice)
                );
                const trade2Risk = Math.abs(
                  parseFloat(selectedTrades[1].entryPrice) -
                    parseFloat(selectedTrades[1].exitPrice)
                );
                return renderComparisonRow(
                  "Risk per Share",
                  `₹${trade1Risk.toFixed(2)}`,
                  `₹${trade2Risk.toFixed(2)}`
                );
              })()}
            </View>

            {/* Notes Comparison */}
            {(selectedTrades[0].notes || selectedTrades[1].notes) && (
              <View className="bg-surface rounded-lg p-4 border border-border">
                <Text className="text-sm font-bold text-foreground mb-3">
                  Notes
                </Text>
                <View className="flex-row gap-2">
                  <View className="flex-1 bg-background rounded p-3">
                    <Text className="text-xs text-muted mb-1">Trade 1</Text>
                    <Text className="text-xs text-foreground">
                      {selectedTrades[0].notes || "No notes"}
                    </Text>
                  </View>
                  <View className="flex-1 bg-background rounded p-3">
                    <Text className="text-xs text-muted mb-1">Trade 2</Text>
                    <Text className="text-xs text-foreground">
                      {selectedTrades[1].notes || "No notes"}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Trade Selection List */}
        <Text className="text-lg font-bold text-foreground mb-3">
          Available Trades
        </Text>
        {trades.length === 0 ? (
          <View className="bg-surface rounded-lg p-6 items-center">
            <Text className="text-sm text-muted">No trades to compare</Text>
          </View>
        ) : (
          <FlatList
            data={trades}
            scrollEnabled={false}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => {
              const isSelected = selectedTrades.find((t) => t.id === item.id);
              const pnl = parseFloat(item.pnl || "0");
              return (
                <TouchableOpacity
                  onPress={() => toggleTradeSelection(item)}
                  className={`rounded-lg p-4 mb-2 border ${
                    isSelected
                      ? "bg-primary/10 border-primary"
                      : "bg-surface border-border"
                  }`}
                >
                  <View className="flex-row justify-between items-start">
                    <View className="flex-1">
                      <Text className="text-base font-bold text-foreground">
                        {item.symbol} - {item.tradeType.toUpperCase()}
                      </Text>
                      <Text className="text-xs text-muted">
                        {new Date(item.entryDate).toLocaleDateString()}
                      </Text>
                    </View>
                    <Text
                      className={`text-sm font-bold ${
                        pnl >= 0 ? "text-success" : "text-error"
                      }`}
                    >
                      {pnl >= 0 ? "+" : ""}₹{pnl.toFixed(2)}
                    </Text>
                  </View>
                  {isSelected && (
                    <View className="mt-2 flex-row items-center">
                      <View className="w-2 h-2 rounded-full bg-primary mr-2" />
                      <Text className="text-xs text-primary font-semibold">
                        Selected
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
