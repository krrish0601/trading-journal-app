import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { TradeCard } from "@/components/trade-card";
import { DatePicker } from "@/components/date-picker";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function SearchTradesScreen() {
  const router = useRouter();
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [searchSymbol, setSearchSymbol] = useState("");

  const { data: trades = [] } = trpc.trades.list.useQuery();

  // Filter trades by date range and symbol
  const filteredTrades = trades.filter((trade) => {
    const tradeDate = new Date(trade.entryDate).toISOString().split("T")[0];
    const inDateRange = tradeDate >= startDate && tradeDate <= endDate;
    const matchesSymbol =
      searchSymbol === "" ||
      trade.symbol.toLowerCase().includes(searchSymbol.toLowerCase());
    return inDateRange && matchesSymbol;
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-bold text-foreground">
            Search Trades
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary font-semibold">Close</Text>
          </TouchableOpacity>
        </View>

        {/* Symbol Search */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-foreground mb-2">
            Symbol
          </Text>
          <TextInput
            placeholder="Search by symbol (e.g., AAPL)"
            placeholderTextColor="#999"
            value={searchSymbol}
            onChangeText={setSearchSymbol}
            className="bg-surface border border-border rounded-lg p-3 text-foreground"
          />
        </View>

        {/* Date Range */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-3">
            Date Range
          </Text>

          <DatePicker
            value={startDate}
            onChange={setStartDate}
            label="From"
          />

          <View className="my-2 items-center">
            <Text className="text-xs text-muted">to</Text>
          </View>

          <DatePicker
            value={endDate}
            onChange={setEndDate}
            label="To"
          />
        </View>

        {/* Results Summary */}
        <View className="bg-surface rounded-lg p-4 mb-6">
          <View className="flex-row justify-between mb-2">
            <Text className="text-sm text-muted">Period</Text>
            <Text className="text-sm font-semibold text-foreground">
              {formatDate(startDate)} - {formatDate(endDate)}
            </Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-sm text-muted">Trades Found</Text>
            <Text className="text-sm font-bold text-primary">
              {filteredTrades.length}
            </Text>
          </View>
        </View>

        {/* Trades List */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-foreground mb-4">
            Results
          </Text>

          {filteredTrades.length > 0 ? (
            filteredTrades.map((trade) => (
              <TradeCard
                key={trade.id}
                trade={trade}
                onPress={() => router.push(`/trade-detail?id=${trade.id}`)}
              />
            ))
          ) : (
            <View className="bg-surface rounded-lg p-8 items-center">
              <Text className="text-muted mb-2">No trades found</Text>
              <Text className="text-xs text-muted">
                Try adjusting your search criteria
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
