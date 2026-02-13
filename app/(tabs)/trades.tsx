import { FlatList, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { TradeCard } from "@/components/trade-card";
import { trpc } from "@/lib/trpc";
import { useLocalAuth } from "@/hooks/use-local-auth";
import { useState } from "react";

export default function TradesScreen() {
  const router = useRouter();
  const { isAuthenticated } = useLocalAuth();
  const [filterType, setFilterType] = useState<"all" | "long" | "short">("all");

  const { data: trades = [], isLoading } = trpc.trades.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const filteredTrades = trades.filter((trade) => {
    if (filterType === "all") return true;
    return trade.tradeType === filterType;
  });



  return (
    <ScreenContainer className="p-0">
      <FlatList
        data={filteredTrades}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TradeCard
            trade={item}
            onPress={() => {
              // Navigate to trade detail
            }}
          />
        )}
        ListHeaderComponent={
          <View className="p-4 pb-0">
            <Text className="text-3xl font-bold text-foreground mb-4">
              All Trades
            </Text>

            {/* Filter Buttons */}
            <View className="flex-row gap-2 mb-4">
              {["all", "long", "short"].map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setFilterType(type as any)}
                  className={`px-4 py-2 rounded-full ${
                    filterType === type
                      ? "bg-primary"
                      : "bg-surface border border-border"
                  }`}
                >
                  <Text
                    className={`font-semibold capitalize ${
                      filterType === type
                        ? "text-background"
                        : "text-foreground"
                    }`}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Stats */}
            <View className="flex-row justify-between mb-4 p-3 bg-surface rounded-lg">
              <View>
                <Text className="text-xs text-muted">Total</Text>
                <Text className="text-lg font-bold text-foreground">
                  {filteredTrades.length}
                </Text>
              </View>
              <View>
                <Text className="text-xs text-muted">Win Rate</Text>
                <Text className="text-lg font-bold text-success">
                  {filteredTrades.length > 0
                    ? (
                        (filteredTrades.filter(
                          (t) => parseFloat(t.pnl?.toString() || "0") > 0
                        ).length /
                          filteredTrades.length) *
                        100
                      ).toFixed(0)
                    : 0}
                  %
                </Text>
              </View>
              <View>
                <Text className="text-xs text-muted">Total P&L</Text>
                <Text
                  className={`text-lg font-bold ${
                    filteredTrades.reduce(
                      (sum, t) => sum + parseFloat(t.pnl?.toString() || "0"),
                      0
                    ) >= 0
                      ? "text-success"
                      : "text-error"
                  }`}
                >
                  $
                  {filteredTrades
                    .reduce(
                      (sum, t) => sum + parseFloat(t.pnl?.toString() || "0"),
                      0
                    )
                    .toFixed(2)}
                </Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="p-4 items-center justify-center py-12">
            {isLoading ? (
              <ActivityIndicator size="large" />
            ) : (
              <>
                <Text className="text-base text-muted mb-4">
                  No trades found
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/trade-entry")}
                  className="bg-primary px-6 py-2 rounded-full"
                >
                  <Text className="text-background font-semibold">
                    Log a Trade
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        }
        ListFooterComponent={<View className="h-8" />}
        scrollEnabled={true}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </ScreenContainer>
  );
}
