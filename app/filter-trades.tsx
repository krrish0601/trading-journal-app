import { View, Text, ScrollView, TouchableOpacity, FlatList, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useDeviceTrades } from "@/hooks/use-device-trades";
import { useState } from "react";

type SortBy = "date" | "pnl" | "symbol" | "type";

export default function FilterTradesScreen() {
  const router = useRouter();
  const { data: trades = [] } = useDeviceTrades();

  const [sortBy, setSortBy] = useState<SortBy>("date");
  const [filterType, setFilterType] = useState<"all" | "long" | "short">("all");
  const [searchSymbol, setSearchSymbol] = useState("");

  // Filter trades
  let filtered = trades.filter((trade) => {
    if (filterType !== "all" && trade.tradeType !== filterType) return false;
    if (searchSymbol && !trade.symbol.toUpperCase().includes(searchSymbol.toUpperCase())) {
      return false;
    }
    return true;
  });

  // Sort trades
  filtered = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "date":
        return new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime();
      case "pnl":
        return parseFloat(b.pnl || "0") - parseFloat(a.pnl || "0");
      case "symbol":
        return a.symbol.localeCompare(b.symbol);
      case "type":
        return a.tradeType.localeCompare(b.tradeType);
      default:
        return 0;
    }
  });

  const renderTradeCard = ({ item }: { item: (typeof trades)[0] }) => (
    <TouchableOpacity
      onPress={() => router.push(`/trade-detail?id=${item.id}`)}
      className="bg-surface rounded-lg p-4 mb-3 border border-border"
    >
      <View className="flex-row justify-between items-start">
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
    </TouchableOpacity>
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-bold text-foreground">Filter & Sort</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary font-semibold">Done</Text>
          </TouchableOpacity>
        </View>

        {/* Search by Symbol */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-2">Search Symbol</Text>
          <TextInput
            placeholder="e.g., AAPL, BTC"
            placeholderTextColor="#999"
            value={searchSymbol}
            onChangeText={setSearchSymbol}
            className="bg-surface border border-border rounded-lg p-3 text-foreground"
          />
        </View>

        {/* Filter by Type */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-2">Trade Type</Text>
          <View className="flex-row gap-3">
            {["all", "long", "short"].map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setFilterType(type as "all" | "long" | "short")}
                className={`flex-1 py-3 rounded-lg items-center ${
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
        </View>

        {/* Sort By */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-2">Sort By</Text>
          <View className="gap-2">
            {[
              { key: "date", label: "Date (Newest)" },
              { key: "pnl", label: "P&L (Highest)" },
              { key: "symbol", label: "Symbol (A-Z)" },
              { key: "type", label: "Trade Type" },
            ].map(({ key, label }) => (
              <TouchableOpacity
                key={key}
                onPress={() => setSortBy(key as SortBy)}
                className={`py-3 px-4 rounded-lg flex-row items-center ${
                  sortBy === key
                    ? "bg-primary"
                    : "bg-surface border border-border"
                }`}
              >
                <View
                  className={`w-5 h-5 rounded border-2 mr-3 items-center justify-center ${
                    sortBy === key
                      ? "bg-primary border-primary"
                      : "border-border"
                  }`}
                >
                  {sortBy === key && (
                    <Text className="text-background font-bold">✓</Text>
                  )}
                </View>
                <Text
                  className={`font-semibold ${
                    sortBy === key
                      ? "text-background"
                      : "text-foreground"
                  }`}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Results */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-foreground mb-3">
            Results ({filtered.length})
          </Text>
          {filtered.length > 0 ? (
            <FlatList
              data={filtered}
              renderItem={renderTradeCard}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          ) : (
            <View className="bg-surface rounded-lg p-4 items-center justify-center">
              <Text className="text-sm text-muted">No trades match your filters</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
