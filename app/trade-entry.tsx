import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useLocalAuth } from "@/hooks/use-local-auth";
import { useState } from "react";
import React from "react";
import { DatePicker } from "@/components/date-picker";

export default function TradeEntryScreen() {
  const router = useRouter();
  const { isAuthenticated } = useLocalAuth();

  const [symbol, setSymbol] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [entryPrice, setEntryPrice] = useState("");
  const [exitDate, setExitDate] = useState(new Date().toISOString().split("T")[0]);
  const [exitPrice, setExitPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [tradeType, setTradeType] = useState<"long" | "short">("long");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
  const [currency, setCurrency] = useState<"USD" | "INR">("INR");

  const createMutation = trpc.trades.create.useMutation({
    onSuccess: () => {
      Alert.alert("Success", "Trade logged successfully");
      router.push("/(tabs)");
    },
    onError: (error) => {
      Alert.alert("Error", error.message || "Failed to create trade");
    },
  });

  const handleSubmit = async () => {
    if (!symbol || !entryPrice || !exitPrice || !quantity) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      await createMutation.mutateAsync({
        symbol: symbol.toUpperCase(),
        entryDate: new Date(entryDate),
        entryPrice: parseFloat(entryPrice),
        exitDate: new Date(exitDate),
        exitPrice: parseFloat(exitPrice),
        quantity: parseFloat(quantity),
        tradeType,
        notes: notes || undefined,
        tags: tags || undefined,
      });
    } catch (error) {
      console.error("Failed to create trade:", error);
    }
  };



  const pnl =
    entryPrice && exitPrice && quantity
      ? tradeType === "long"
        ? (parseFloat(exitPrice) - parseFloat(entryPrice)) * parseFloat(quantity)
        : (parseFloat(entryPrice) - parseFloat(exitPrice)) * parseFloat(quantity)
      : 0;

  const pnlPercent =
    entryPrice && exitPrice
      ? ((parseFloat(exitPrice) - parseFloat(entryPrice)) / parseFloat(entryPrice)) * 100
      : 0;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScreenContainer className="p-4">
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-bold text-foreground">
            New Trade
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary font-semibold">Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Symbol */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-foreground mb-2">
            Symbol *
          </Text>
          <TextInput
            placeholder="e.g., AAPL, BTC"
            placeholderTextColor="#999"
            value={symbol}
            onChangeText={setSymbol}
            className="bg-surface border border-border rounded-lg p-3 text-foreground"
          />
        </View>

        {/* Trade Type */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-foreground mb-2">
            Trade Type
          </Text>
          <View className="flex-row gap-3">
            {["long", "short"].map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setTradeType(type as "long" | "short")}
                className={`flex-1 py-3 rounded-lg items-center ${
                  tradeType === type
                    ? type === "long"
                      ? "bg-success/20"
                      : "bg-error/20"
                    : "bg-surface border border-border"
                }`}
              >
                <Text
                  className={`font-semibold capitalize ${
                    tradeType === type
                      ? type === "long"
                        ? "text-success"
                        : "text-error"
                      : "text-foreground"
                  }`}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Currency Selection */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-foreground mb-2">
            Currency
          </Text>
          <View className="flex-row gap-3">
            {["INR", "USD"].map((curr) => (
              <TouchableOpacity
                key={curr}
                onPress={() => setCurrency(curr as "USD" | "INR")}
                className={`flex-1 py-3 rounded-lg items-center ${
                  currency === curr
                    ? "bg-primary"
                    : "bg-surface border border-border"
                }`}
              >
                <Text
                  className={`font-semibold ${
                    currency === curr
                      ? "text-background"
                      : "text-foreground"
                  }`}
                >
                  {curr}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Entry Details */}
        <View className="bg-surface rounded-lg p-4 mb-4">
          <Text className="text-sm font-semibold text-foreground mb-3">
            Entry
          </Text>

          <View className="mb-3">
            <DatePicker
              value={entryDate}
              onChange={setEntryDate}
              label="Date"
            />
          </View>

          <View>
            <Text className="text-xs text-muted mb-1">Price *</Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor="#999"
              value={entryPrice}
              onChangeText={setEntryPrice}
              keyboardType="decimal-pad"
              className="bg-background border border-border rounded-lg p-3 text-foreground"
            />
          </View>
        </View>

        {/* Exit Details */}
        <View className="bg-surface rounded-lg p-4 mb-4">
          <Text className="text-sm font-semibold text-foreground mb-3">
            Exit
          </Text>

          <View className="mb-3">
            <DatePicker
              value={exitDate}
              onChange={setExitDate}
              label="Date"
            />
          </View>

          <View>
            <Text className="text-xs text-muted mb-1">Price *</Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor="#999"
              value={exitPrice}
              onChangeText={setExitPrice}
              keyboardType="decimal-pad"
              className="bg-background border border-border rounded-lg p-3 text-foreground"
            />
          </View>
        </View>

        {/* Quantity */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-foreground mb-2">
            Quantity *
          </Text>
          <TextInput
            placeholder="0.00"
            placeholderTextColor="#999"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="decimal-pad"
            className="bg-surface border border-border rounded-lg p-3 text-foreground"
          />
        </View>

        {/* P&L Preview */}
        {pnl !== 0 && (
          <View
            className={`rounded-lg p-4 mb-4 ${
              pnl >= 0 ? "bg-success/10" : "bg-error/10"
            }`}
          >
            <Text className="text-xs text-muted mb-1">Estimated P&L</Text>
            <View className="flex-row justify-between items-end">
              <Text
                className={`text-2xl font-bold ${
                  pnl >= 0 ? "text-success" : "text-error"
                }`}
              >
                {pnl >= 0 ? "+" : ""}{currency === "INR" ? "₹" : "$"}{pnl.toFixed(2)}
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
        )}

        {/* Notes */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-foreground mb-2">
            Notes
          </Text>
          <TextInput
            placeholder="Add trade notes..."
            placeholderTextColor="#999"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            className="bg-surface border border-border rounded-lg p-3 text-foreground"
          />
        </View>

        {/* Tags */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-2">
            Tags
          </Text>
          <TextInput
            placeholder="e.g., technical, breakout"
            placeholderTextColor="#999"
            value={tags}
            onChangeText={setTags}
            className="bg-surface border border-border rounded-lg p-3 text-foreground"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={createMutation.isPending}
          className="bg-primary py-4 rounded-lg items-center mb-4"
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-background font-bold text-lg">
              Log Trade
            </Text>
          )}
        </TouchableOpacity>
        </ScrollView>
      </ScreenContainer>
    </KeyboardAvoidingView>
  );
}
