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
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useLocalAuth } from "@/hooks/use-local-auth";
import { useState } from "react";
import React from "react";
import { DatePicker } from "@/components/date-picker";
import { ImagePickerModal } from "@/components/image-picker-modal";
import { getDeviceId } from "@/lib/device-id";

export default function TradeEntryScreen() {
  const router = useRouter();
  const { isAuthenticated } = useLocalAuth();

  const [symbol, setSymbol] = useState("");
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split("T")[0]);
  const [entryTime, setEntryTime] = useState("");
  const [entryPrice, setEntryPrice] = useState("");
  const [exitDate, setExitDate] = useState(new Date().toISOString().split("T")[0]);
  const [exitTime, setExitTime] = useState("");
  const [exitPrice, setExitPrice] = useState("");
  const [stoploss, setStoploss] = useState("");
  const [quantity, setQuantity] = useState("");
  const [tradeType, setTradeType] = useState<"long" | "short">("long");
  const [notes, setNotes] = useState("");
  const [journalEntry, setJournalEntry] = useState("");
  const [tags, setTags] = useState("");
  const [currency, setCurrency] = useState<"USD" | "INR">("INR");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [deviceId, setDeviceId] = useState<string>("");

  // Initialize device ID on mount
  React.useEffect(() => {
    getDeviceId().then(setDeviceId);
  }, []);

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
    if (!symbol || !entryPrice || !exitPrice || !quantity || !stoploss || !deviceId) {
      Alert.alert("Error", "Please fill in all required fields including stoploss");
      return;
    }

    try {
      await createMutation.mutateAsync({
        deviceId,
        symbol: symbol.toUpperCase(),
        entryDate: new Date(entryDate),
        entryTime: entryTime || undefined,
        entryPrice: parseFloat(entryPrice),
        exitDate: new Date(exitDate),
        exitTime: exitTime || undefined,
        exitPrice: parseFloat(exitPrice),
        stoploss: stoploss ? parseFloat(stoploss) : undefined,
        quantity: parseFloat(quantity),
        tradeType,
        notes: notes || undefined,
        journalEntry: journalEntry || undefined,
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

          <View className="mb-3">
            <Text className="text-xs text-muted mb-1">Time (HH:MM)</Text>
            <TextInput
              placeholder="09:30"
              placeholderTextColor="#999"
              value={entryTime}
              onChangeText={setEntryTime}
              maxLength={5}
              className="bg-background border border-border rounded-lg p-3 text-foreground"
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

          <View className="mb-3">
            <Text className="text-xs text-muted mb-1">Time (HH:MM)</Text>
            <TextInput
              placeholder="14:30"
              placeholderTextColor="#999"
              value={exitTime}
              onChangeText={setExitTime}
              maxLength={5}
              className="bg-background border border-border rounded-lg p-3 text-foreground"
            />
          </View>

          <View className="mb-3">
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

          <View>
            <Text className="text-xs text-muted mb-1">Stoploss *</Text>
            <TextInput
              placeholder="0.00"
              placeholderTextColor="#999"
              value={stoploss}
              onChangeText={setStoploss}
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

        {/* Journal Entry */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-foreground mb-2">
            Trade Journal Entry
          </Text>
          <TextInput
            placeholder="Write your post-trade review here. What went right? What went wrong? What did you learn?"
            placeholderTextColor="#999"
            value={journalEntry}
            onChangeText={setJournalEntry}
            multiline
            numberOfLines={4}
            className="bg-surface border border-border rounded-lg p-3 text-foreground"
          />
        </View>

        {/* Tags */}
        <View className="mb-4">
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

        {/* Trade Screenshots */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-sm font-semibold text-foreground">
              Trade Screenshots
            </Text>
            <TouchableOpacity
              onPress={() => setShowImagePicker(true)}
              className="bg-primary/20 border border-primary px-3 py-1 rounded-full"
            >
              <Text className="text-primary text-xs font-semibold">+ Add</Text>
            </TouchableOpacity>
          </View>
          {selectedImages.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
              {selectedImages.map((uri, index) => (
                <View key={index} className="relative">
                  <Image
                    source={{ uri }}
                    className="w-20 h-20 rounded-lg"
                  />
                  <TouchableOpacity
                    onPress={() =>
                      setSelectedImages(
                        selectedImages.filter((_, i) => i !== index)
                      )
                    }
                    className="absolute top-0 right-0 bg-error rounded-full w-5 h-5 items-center justify-center"
                  >
                    <Text className="text-background text-xs font-bold">x</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
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
      <ImagePickerModal
        visible={showImagePicker}
        onClose={() => setShowImagePicker(false)}
        onImagesSelected={(images) => {
          setSelectedImages([...selectedImages, ...images]);
          setShowImagePicker(false);
        }}
      />
    </KeyboardAvoidingView>
  );
}
