import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function CalendarHeatmapScreen() {
  const router = useRouter();
  const { data: trades = [], isLoading } = trpc.trades.list.useQuery();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  if (isLoading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" />
      </ScreenContainer>
    );
  }

  // Group trades by date
  const tradesByDate: Record<string, { count: number; pnl: number }> = {};

  trades.forEach((trade) => {
    const date = new Date(trade.entryDate).toISOString().split("T")[0];
    if (!tradesByDate[date]) {
      tradesByDate[date] = { count: 0, pnl: 0 };
    }
    tradesByDate[date].count++;
    tradesByDate[date].pnl += parseFloat(trade.pnl?.toString() || "0");
  });

  // Generate calendar for selected month
  const firstDay = new Date(selectedYear, selectedMonth, 1);
  const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const getColorForDay = (day: number | null) => {
    if (day === null) return "bg-transparent";

    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayData = tradesByDate[dateStr];

    if (!dayData) return "bg-surface border border-border";

    if (dayData.pnl > 0) {
      if (dayData.pnl > 500) return "bg-success";
      if (dayData.pnl > 200) return "bg-success/70";
      return "bg-success/40";
    } else if (dayData.pnl < 0) {
      if (dayData.pnl < -500) return "bg-error";
      if (dayData.pnl < -200) return "bg-error/70";
      return "bg-error/40";
    }
    return "bg-warning/40";
  };

  const getDayInfo = (day: number | null) => {
    if (day === null) return null;

    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return tradesByDate[dateStr];
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <View className="flex-row justify-between items-center mb-6">
        <Text className="text-3xl font-bold text-foreground">
          Trading Calendar
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text className="text-primary font-semibold">Close</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Month Navigation */}
        <View className="flex-row justify-between items-center mb-6 bg-surface rounded-lg p-4">
          <TouchableOpacity onPress={handlePrevMonth}>
            <Text className="text-primary text-2xl">‹</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold text-foreground">
            {MONTHS[selectedMonth]} {selectedYear}
          </Text>
          <TouchableOpacity onPress={handleNextMonth}>
            <Text className="text-primary text-2xl">›</Text>
          </TouchableOpacity>
        </View>

        {/* Legend */}
        <View className="bg-surface rounded-lg p-4 mb-6">
          <Text className="text-sm font-semibold text-foreground mb-3">
            Legend
          </Text>
          <View className="space-y-2">
            <View className="flex-row items-center gap-3">
              <View className="w-6 h-6 bg-success rounded" />
              <Text className="text-xs text-muted">Profitable Trade</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="w-6 h-6 bg-error rounded" />
              <Text className="text-xs text-muted">Loss Trade</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="w-6 h-6 bg-warning/40 rounded" />
              <Text className="text-xs text-muted">Break-Even</Text>
            </View>
            <View className="flex-row items-center gap-3">
              <View className="w-6 h-6 bg-surface border border-border rounded" />
              <Text className="text-xs text-muted">No Trades</Text>
            </View>
          </View>
        </View>

        {/* Calendar Grid */}
        <View className="bg-surface rounded-lg p-4 mb-6">
          {/* Day Headers */}
          <View className="flex-row justify-between mb-2">
            {DAYS.map((day) => (
              <Text
                key={day}
                className="text-xs font-bold text-muted text-center flex-1"
              >
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Days */}
          <View>
            {Array.from({ length: Math.ceil(calendarDays.length / 7) }).map(
              (_, weekIndex) => (
                <View key={weekIndex} className="flex-row justify-between mb-2">
                  {calendarDays
                    .slice(weekIndex * 7, (weekIndex + 1) * 7)
                    .map((day, dayIndex) => {
                      const dayInfo = getDayInfo(day);
                      return (
                        <View
                          key={`${weekIndex}-${dayIndex}`}
                          className={`flex-1 aspect-square rounded-lg mx-0.5 items-center justify-center ${getColorForDay(day)}`}
                        >
                          {day !== null && (
                            <View className="items-center">
                              <Text className="text-xs font-semibold text-foreground">
                                {day}
                              </Text>
                              {dayInfo && (
                                <Text className="text-xs text-muted">
                                  {dayInfo.count}
                                </Text>
                              )}
                            </View>
                          )}
                        </View>
                      );
                    })}
                </View>
              )
            )}
          </View>
        </View>

        {/* Statistics */}
        <View className="bg-surface rounded-lg p-4 mb-8">
          <Text className="text-lg font-bold text-foreground mb-4">
            {MONTHS[selectedMonth]} Statistics
          </Text>
          <View className="space-y-3">
            <View className="flex-row justify-between pb-3 border-b border-border">
              <Text className="text-sm text-muted">Trading Days</Text>
              <Text className="text-sm font-bold text-foreground">
                {Object.keys(tradesByDate).filter((date) =>
                  date.startsWith(
                    `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`
                  )
                ).length}
              </Text>
            </View>
            <View className="flex-row justify-between pb-3 border-b border-border">
              <Text className="text-sm text-muted">Total Trades</Text>
              <Text className="text-sm font-bold text-foreground">
                {Object.entries(tradesByDate)
                  .filter((entry) =>
                    entry[0].startsWith(
                      `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`
                    )
                  )
                  .reduce((sum, entry) => sum + entry[1].count, 0)}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Month P&L</Text>
              <Text
                className={`text-sm font-bold ${
                  Object.entries(tradesByDate)
                    .filter((entry) =>
                      entry[0].startsWith(
                        `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`
                      )
                    )
                    .reduce((sum, entry) => sum + entry[1].pnl, 0) >= 0
                    ? "text-success"
                    : "text-error"
                }`}
              >
                ₹
                {Object.entries(tradesByDate)
                  .filter((entry) =>
                    entry[0].startsWith(
                      `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}`
                    )
                  )
                  .reduce((sum, entry) => sum + entry[1].pnl, 0)
                  .toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
