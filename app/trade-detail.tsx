import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { getDeviceId } from "@/lib/device-id";

export default function TradeDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [deviceId, setDeviceId] = useState<string>("");

  useEffect(() => {
    getDeviceId().then(setDeviceId);
  }, []);

  const tradeId = typeof id === "string" ? parseInt(id) : 0;

  const { data: trades = [] } = trpc.trades.list.useQuery({ deviceId }, { enabled: !!deviceId });
  const trade = trades.find((t) => t.id === tradeId);

  const deleteMutation = trpc.trades.delete.useMutation({
    onSuccess: () => {
      Alert.alert("Success", "Trade deleted successfully");
      router.back();
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to delete trade");
    },
  });

  const handleDelete = () => {
    Alert.alert(
      "Delete Trade",
      "Are you sure you want to delete this trade?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMutation.mutate({ id: tradeId }),
        },
      ]
    );
  };

  if (!trade) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  const pnl = parseFloat(trade.pnl?.toString() || "0");
  const pnlPercent = parseFloat(trade.pnlPercent?.toString() || "0");
  const entryPrice = parseFloat(trade.entryPrice);
  const exitPrice = parseFloat(trade.exitPrice);
  const quantity = parseFloat(trade.quantity);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row justify-between items-start mb-6">
          <View className="flex-1">
            <Text className="text-3xl font-bold text-foreground">
              {trade.symbol}
            </Text>
            <Text className="text-sm text-muted mt-1 capitalize">
              {trade.tradeType} Trade
            </Text>
          </View>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary font-semibold">Close</Text>
          </TouchableOpacity>
        </View>

        {/* P&L Card */}
        <View
          className={`rounded-lg p-4 mb-6 ${
            pnl >= 0 ? "bg-success/10" : "bg-error/10"
          }`}
        >
          <Text className="text-xs text-muted mb-1">Profit/Loss</Text>
          <View className="flex-row justify-between items-end">
            <Text
              className={`text-3xl font-bold ${
                pnl >= 0 ? "text-success" : "text-error"
              }`}
            >
              {pnl >= 0 ? "+" : ""}₹{pnl.toFixed(2)}
            </Text>
            <Text
              className={`text-lg font-semibold ${
                pnl >= 0 ? "text-success" : "text-error"
              }`}
            >
              {pnlPercent >= 0 ? "+" : ""}{pnlPercent.toFixed(2)}%
            </Text>
          </View>
        </View>

        {/* Trade Details */}
        <View className="bg-surface rounded-lg p-4 mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">
            Trade Details
          </Text>

          <View className="space-y-3">
            <View className="flex-row justify-between pb-3 border-b border-border">
              <Text className="text-sm text-muted">Entry Date</Text>
              <Text className="text-sm font-semibold text-foreground">
                {formatDate(trade.entryDate)}
              </Text>
            </View>

            <View className="flex-row justify-between pb-3 border-b border-border">
              <Text className="text-sm text-muted">Entry Price</Text>
              <Text className="text-sm font-semibold text-foreground">
                ₹{entryPrice.toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between pb-3 border-b border-border">
              <Text className="text-sm text-muted">Exit Date</Text>
              <Text className="text-sm font-semibold text-foreground">
                {formatDate(trade.exitDate)}
              </Text>
            </View>

            <View className="flex-row justify-between pb-3 border-b border-border">
              <Text className="text-sm text-muted">Exit Price</Text>
              <Text className="text-sm font-semibold text-foreground">
                ₹{exitPrice.toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between pb-3 border-b border-border">
              <Text className="text-sm text-muted">Quantity</Text>
              <Text className="text-sm font-semibold text-foreground">
                {quantity}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Trade Type</Text>
              <Text className="text-sm font-semibold text-foreground capitalize">
                {trade.tradeType}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {trade.notes && (
          <View className="bg-surface rounded-lg p-4 mb-6">
            <Text className="text-lg font-bold text-foreground mb-2">
              Notes
            </Text>
            <Text className="text-sm text-muted leading-relaxed">
              {trade.notes}
            </Text>
          </View>
        )}

        {/* Tags */}
        {trade.tags && (
          <View className="mb-6">
            <Text className="text-lg font-bold text-foreground mb-3">Tags</Text>
            <View className="flex-row flex-wrap gap-2">
              {trade.tags.split(",").map((tag, i) => (
                <View
                  key={i}
                  className="bg-primary/20 px-3 py-1 rounded-full"
                >
                  <Text className="text-sm text-primary font-semibold">
                    {tag.trim()}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Calculations */}
        <View className="bg-surface rounded-lg p-4 mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">
            Calculations
          </Text>

          <View className="space-y-3">
            <View className="flex-row justify-between pb-3 border-b border-border">
              <Text className="text-sm text-muted">Price Move</Text>
              <Text className="text-sm font-semibold text-foreground">
                ₹{(exitPrice - entryPrice).toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between pb-3 border-b border-border">
              <Text className="text-sm text-muted">Risk/Reward</Text>
              <Text className="text-sm font-semibold text-foreground">
                {(
                  Math.abs((exitPrice - entryPrice) / (exitPrice - entryPrice))
                ).toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Total Value</Text>
              <Text className="text-sm font-semibold text-foreground">
                ₹{(entryPrice * quantity).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="flex-row gap-3 mb-8">
          <TouchableOpacity
            onPress={() => router.push(`/trade-edit?id=${trade.id}`)}
            className="flex-1 bg-primary py-3 rounded-lg items-center"
          >
            <Text className="text-background font-bold">Edit Trade</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex-1 bg-error/10 py-3 rounded-lg items-center"
          >
            {deleteMutation.isPending ? (
              <ActivityIndicator color="#EF4444" />
            ) : (
              <Text className="text-error font-bold">Delete</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
