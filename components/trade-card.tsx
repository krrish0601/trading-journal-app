import { Pressable, Text, View } from "react-native";
import { Trade } from "@/drizzle/schema";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

interface TradeCardProps {
  trade: Trade;
  onPress?: () => void;
}

export function TradeCard({ trade, onPress }: TradeCardProps) {
  const colors = useColors();
  const pnl = parseFloat(trade.pnl?.toString() || "0");
  const pnlPercent = parseFloat(trade.pnlPercent?.toString() || "0");
  const isProfit = pnl >= 0;

  const entryDate = new Date(trade.entryDate);
  const dateStr = entryDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
    >
      <View className="bg-surface rounded-lg p-4 mb-3 border border-border">
        {/* Header: Symbol and P&L */}
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-lg font-bold text-foreground">
              {trade.symbol}
            </Text>
            <Text className="text-sm text-muted mt-1">{dateStr}</Text>
          </View>
          <View className="items-end">
            <Text
              className={cn(
                "text-lg font-bold",
                isProfit ? "text-success" : "text-error"
              )}
            >
              {isProfit ? "+" : ""}{pnl.toFixed(2)}
            </Text>
            <Text
              className={cn(
                "text-sm",
                isProfit ? "text-success" : "text-error"
              )}
            >
              {isProfit ? "+" : ""}{pnlPercent.toFixed(2)}%
            </Text>
          </View>
        </View>

        {/* Trade Details */}
        <View className="flex-row justify-between mb-2">
          <View className="flex-1">
            <Text className="text-xs text-muted mb-1">Entry</Text>
            <Text className="text-sm font-semibold text-foreground">
              ${parseFloat(trade.entryPrice?.toString() || "0").toFixed(2)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-muted mb-1">Exit</Text>
            <Text className="text-sm font-semibold text-foreground">
              ${parseFloat(trade.exitPrice?.toString() || "0").toFixed(2)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-xs text-muted mb-1">Qty</Text>
            <Text className="text-sm font-semibold text-foreground">
              {parseFloat(trade.quantity?.toString() || "0").toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Trade Type Badge */}
        <View className="flex-row justify-between items-center">
          <View
            className={cn(
              "px-3 py-1 rounded-full",
              trade.tradeType === "long"
                ? "bg-success/20"
                : "bg-error/20"
            )}
          >
            <Text
              className={cn(
                "text-xs font-semibold capitalize",
                trade.tradeType === "long"
                  ? "text-success"
                  : "text-error"
              )}
            >
              {trade.tradeType}
            </Text>
          </View>
          {trade.tags && (
            <Text className="text-xs text-muted">{trade.tags}</Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}
