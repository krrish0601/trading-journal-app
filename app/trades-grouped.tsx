import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  SectionList,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { TradeCard } from "@/components/trade-card";
import { trpc } from "@/lib/trpc";
import React from "react";

export default function TradesGroupedScreen() {
  const router = useRouter();
  const [deviceId, setDeviceId] = React.useState<string>("");

  React.useEffect(() => {
    import("@/lib/device-id").then((mod) => {
      mod.getDeviceId().then(setDeviceId);
    });
  }, []);

  const { data: trades = [], isLoading } = trpc.trades.list.useQuery({ deviceId }, { enabled: !!deviceId });

  if (isLoading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  // Separate winning and losing trades
  const winningTrades = trades.filter(
    (t) => parseFloat(t.pnl?.toString() || "0") > 0
  );
  const losingTrades = trades.filter(
    (t) => parseFloat(t.pnl?.toString() || "0") < 0
  );
  const breakEvenTrades = trades.filter(
    (t) => parseFloat(t.pnl?.toString() || "0") === 0
  );

  // Calculate totals for each group
  const winningTotal = winningTrades.reduce(
    (sum, t) => sum + parseFloat(t.pnl?.toString() || "0"),
    0
  );
  const losingTotal = losingTrades.reduce(
    (sum, t) => sum + parseFloat(t.pnl?.toString() || "0"),
    0
  );

  const sections = [
    {
      title: `✅ Winning Trades (${winningTrades.length})`,
      data: winningTrades,
      total: winningTotal,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: `❌ Losing Trades (${losingTrades.length})`,
      data: losingTrades,
      total: losingTotal,
      color: "text-error",
      bgColor: "bg-error/10",
    },
    ...(breakEvenTrades.length > 0
      ? [
          {
            title: `⚪ Break-Even Trades (${breakEvenTrades.length})`,
            data: breakEvenTrades,
            total: 0,
            color: "text-muted",
            bgColor: "bg-surface",
          },
        ]
      : []),
  ];

  return (
    <ScreenContainer className="p-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-3xl font-bold text-foreground">
          Trades Analysis
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary font-semibold">Close</Text>
        </TouchableOpacity>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => router.push(`/trade-detail?id=${item.id}`)}
            className="mb-3"
          >
            <TradeCard trade={item} />
          </TouchableOpacity>
        )}
        renderSectionHeader={({ section: { title, total, color, bgColor } }) => (
          <View className={`${bgColor} rounded-lg p-4 mb-4 mt-4`}>
            <View className="flex-row justify-between items-center">
              <Text className={`text-lg font-bold ${color}`}>
                {title}
              </Text>
              <Text className={`text-lg font-bold ${color}`}>
                ₹{Math.abs(total).toFixed(2)}
              </Text>
            </View>
          </View>
        )}
        scrollEnabled={true}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </ScreenContainer>
  );
}
