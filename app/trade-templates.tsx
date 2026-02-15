import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function TradeTemplatesScreen() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [tradeType, setTradeType] = useState<"long" | "short">("long");
  const [riskPercent, setRiskPercent] = useState("");
  const [rewardPercent, setRewardPercent] = useState("");
  const [notes, setNotes] = useState("");

  // Mock templates data - in real app would come from API
  const [templates, setTemplates] = useState<
    Array<{
      id: number;
      name: string;
      symbol: string;
      tradeType: "long" | "short";
      riskPercent?: string;
      rewardPercent?: string;
      notes?: string;
    }>
  >([]);

  const handleCreateTemplate = () => {
    if (!templateName || !symbol) {
      Alert.alert("Error", "Please fill in template name and symbol");
      return;
    }

    const newTemplate = {
      id: Date.now(),
      name: templateName,
      symbol,
      tradeType,
      riskPercent,
      rewardPercent,
      notes,
    };

    setTemplates([...templates, newTemplate]);
    setTemplateName("");
    setSymbol("");
    setTradeType("long");
    setRiskPercent("");
    setRewardPercent("");
    setNotes("");
    setShowModal(false);
    Alert.alert("Success", "Template created successfully");
  };

  const handleUseTemplate = (template: (typeof templates)[0]) => {
    // Navigate to trade entry with template data
    router.push({
      pathname: "/trade-entry",
      params: {
        templateId: template.id.toString(),
        symbol: template.symbol,
        tradeType: template.tradeType,
      },
    });
  };

  const handleDeleteTemplate = (id: number) => {
    Alert.alert("Delete Template", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setTemplates(templates.filter((t) => t.id !== id));
        },
      },
    ]);
  };

  return (
    <ScreenContainer className="p-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-3xl font-bold text-foreground">
          Trade Templates
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary font-semibold">Close</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => setShowModal(true)}
        className="bg-primary py-3 rounded-lg items-center mb-6"
      >
        <Text className="text-background font-bold">+ New Template</Text>
      </TouchableOpacity>

      {templates.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-muted text-center">
            No templates yet. Create one to save your favorite trade setups!
          </Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {templates.map((template) => (
            <View
              key={template.id}
              className="bg-surface rounded-lg p-4 mb-4 border border-border"
            >
              <View className="flex-row justify-between items-start mb-3">
                <View className="flex-1">
                  <Text className="text-lg font-bold text-foreground">
                    {template.name}
                  </Text>
                  <Text className="text-sm text-muted">
                    {template.symbol} • {template.tradeType}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteTemplate(template.id)}
                >
                  <Text className="text-error font-bold">✕</Text>
                </TouchableOpacity>
              </View>

              {(template.riskPercent || template.rewardPercent) && (
                <View className="flex-row gap-4 mb-3 pb-3 border-b border-border">
                  {template.riskPercent && (
                    <View>
                      <Text className="text-xs text-muted">Risk</Text>
                      <Text className="text-sm font-semibold text-foreground">
                        {template.riskPercent}%
                      </Text>
                    </View>
                  )}
                  {template.rewardPercent && (
                    <View>
                      <Text className="text-xs text-muted">Reward</Text>
                      <Text className="text-sm font-semibold text-foreground">
                        {template.rewardPercent}%
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {template.notes && (
                <Text className="text-xs text-muted mb-3 italic">
                  {template.notes}
                </Text>
              )}

              <TouchableOpacity
                onPress={() => handleUseTemplate(template)}
                className="bg-primary/20 border border-primary py-2 rounded-lg items-center"
              >
                <Text className="text-primary font-semibold">Use Template</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Create Template Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <ScreenContainer className="p-4">
          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-bold text-foreground">
                New Template
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text className="text-primary font-semibold">Cancel</Text>
              </TouchableOpacity>
            </View>

            {/* Template Name */}
            <View className="mb-4">
              <Text className="text-xs text-muted mb-1">Template Name *</Text>
              <TextInput
                placeholder="e.g., Morning Breakout"
                placeholderTextColor="#999"
                value={templateName}
                onChangeText={setTemplateName}
                className="bg-surface border border-border rounded-lg p-3 text-foreground"
              />
            </View>

            {/* Symbol */}
            <View className="mb-4">
              <Text className="text-xs text-muted mb-1">Symbol *</Text>
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

            {/* Risk Percent */}
            <View className="mb-4">
              <Text className="text-xs text-muted mb-1">Risk % (optional)</Text>
              <TextInput
                placeholder="e.g., 2"
                placeholderTextColor="#999"
                value={riskPercent}
                onChangeText={setRiskPercent}
                keyboardType="decimal-pad"
                className="bg-surface border border-border rounded-lg p-3 text-foreground"
              />
            </View>

            {/* Reward Percent */}
            <View className="mb-4">
              <Text className="text-xs text-muted mb-1">
                Reward % (optional)
              </Text>
              <TextInput
                placeholder="e.g., 4"
                placeholderTextColor="#999"
                value={rewardPercent}
                onChangeText={setRewardPercent}
                keyboardType="decimal-pad"
                className="bg-surface border border-border rounded-lg p-3 text-foreground"
              />
            </View>

            {/* Notes */}
            <View className="mb-6">
              <Text className="text-xs text-muted mb-1">Notes (optional)</Text>
              <TextInput
                placeholder="Add notes about this template..."
                placeholderTextColor="#999"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                className="bg-surface border border-border rounded-lg p-3 text-foreground"
              />
            </View>

            <TouchableOpacity
              onPress={handleCreateTemplate}
              className="bg-primary py-4 rounded-lg items-center"
            >
              <Text className="text-background font-bold text-lg">
                Create Template
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </ScreenContainer>
      </Modal>
    </ScreenContainer>
  );
}
