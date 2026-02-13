import { Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  label?: string;
}

export function DatePicker({ value, onChange, label }: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const handleDateChange = (days: number) => {
    const date = new Date(value);
    date.setDate(date.getDate() + days);
    onChange(date.toISOString().split("T")[0]);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <View>
      {label && (
        <Text className="text-xs text-muted mb-1">{label}</Text>
      )}
      <TouchableOpacity
        onPress={() => setShowPicker(!showPicker)}
        className="bg-surface border border-border rounded-lg p-3 flex-row justify-between items-center"
      >
        <Text className="text-foreground font-semibold">
          {formatDate(value)}
        </Text>
        <Text className="text-muted">📅</Text>
      </TouchableOpacity>

      {showPicker && (
        <View className="bg-surface border border-border rounded-lg p-3 mt-2 gap-2">
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => handleDateChange(-7)}
              className="flex-1 bg-primary/20 py-2 rounded items-center"
            >
              <Text className="text-sm text-primary font-semibold">-7d</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDateChange(-1)}
              className="flex-1 bg-primary/20 py-2 rounded items-center"
            >
              <Text className="text-sm text-primary font-semibold">-1d</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDateChange(1)}
              className="flex-1 bg-primary/20 py-2 rounded items-center"
            >
              <Text className="text-sm text-primary font-semibold">+1d</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDateChange(7)}
              className="flex-1 bg-primary/20 py-2 rounded items-center"
            >
              <Text className="text-sm text-primary font-semibold">+7d</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => {
              onChange(new Date().toISOString().split("T")[0]);
              setShowPicker(false);
            }}
            className="bg-primary py-2 rounded items-center"
          >
            <Text className="text-background font-semibold text-sm">Today</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
