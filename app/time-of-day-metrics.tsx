import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

interface TimeSlotMetrics {
  timeSlot: string;
  trades: number;
  wins: number;
  losses: number;
  totalPnl: number;
  avgPnl: number;
  winRate: number;
}

export default function TimeOfDayMetricsScreen() {
  const router = useRouter();
  const { data: trades = [] } = trpc.trades.list.useQuery();

  // Calculate metrics by time of day
  const calculateTimeMetrics = (): TimeSlotMetrics[] => {
    const timeSlots: { [key: string]: TimeSlotMetrics } = {
      "9:00-12:00": {
        timeSlot: "Morning (9AM-12PM)",
        trades: 0,
        wins: 0,
        losses: 0,
        totalPnl: 0,
        avgPnl: 0,
        winRate: 0,
      },
      "12:00-15:00": {
        timeSlot: "Afternoon (12PM-3PM)",
        trades: 0,
        wins: 0,
        losses: 0,
        totalPnl: 0,
        avgPnl: 0,
        winRate: 0,
      },
      "15:00-18:00": {
        timeSlot: "Late Afternoon (3PM-6PM)",
        trades: 0,
        wins: 0,
        losses: 0,
        totalPnl: 0,
        avgPnl: 0,
        winRate: 0,
      },
      "18:00-21:00": {
        timeSlot: "Evening (6PM-9PM)",
        trades: 0,
        wins: 0,
        losses: 0,
        totalPnl: 0,
        avgPnl: 0,
        winRate: 0,
      },
    };

    trades.forEach((trade) => {
      const entryDate = new Date(trade.entryDate);
      const hour = entryDate.getHours();
      const pnl = parseFloat(trade.pnl || "0");

      let slot = "18:00-21:00";
      if (hour >= 9 && hour < 12) slot = "9:00-12:00";
      else if (hour >= 12 && hour < 15) slot = "12:00-15:00";
      else if (hour >= 15 && hour < 18) slot = "15:00-18:00";

      if (timeSlots[slot]) {
        timeSlots[slot].trades += 1;
        timeSlots[slot].totalPnl += pnl;
        if (pnl > 0) timeSlots[slot].wins += 1;
        else if (pnl < 0) timeSlots[slot].losses += 1;
      }
    });

    // Calculate averages and win rates
    Object.keys(timeSlots).forEach((slot) => {
      const data = timeSlots[slot];
      if (data.trades > 0) {
        data.avgPnl = data.totalPnl / data.trades;
        data.winRate = (data.wins / data.trades) * 100;
      }
    });

    return Object.values(timeSlots);
  };

  const metrics = calculateTimeMetrics();
  const bestSlot = metrics.reduce((best, current) =>
    current.totalPnl > best.totalPnl ? current : best
  );
  const worstSlot = metrics.reduce((worst, current) =>
    current.totalPnl < worst.totalPnl ? current : worst
  );

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-bold text-foreground">
            Time Analysis
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary font-semibold">Back</Text>
          </TouchableOpacity>
        </View>

        {/* Best and Worst Time Slots */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1 bg-success/10 border border-success rounded-lg p-4">
            <Text className="text-xs text-success font-semibold mb-1">
              BEST TIME
            </Text>
            <Text className="text-lg font-bold text-success mb-2">
              {bestSlot.timeSlot}
            </Text>
            <Text className="text-xs text-muted">
              ₹{bestSlot.totalPnl.toFixed(2)} P&L
            </Text>
          </View>

          <View className="flex-1 bg-error/10 border border-error rounded-lg p-4">
            <Text className="text-xs text-error font-semibold mb-1">
              WORST TIME
            </Text>
            <Text className="text-lg font-bold text-error mb-2">
              {worstSlot.timeSlot}
            </Text>
            <Text className="text-xs text-muted">
              ₹{worstSlot.totalPnl.toFixed(2)} P&L
            </Text>
          </View>
        </View>

        {/* Time Slot Metrics */}
        <Text className="text-lg font-bold text-foreground mb-3">
          Performance by Time
        </Text>
        {metrics.map((slot, index) => (
          <View
            key={index}
            className="bg-surface rounded-lg p-4 mb-3 border border-border"
          >
            <View className="flex-row justify-between items-start mb-3">
              <View>
                <Text className="text-base font-bold text-foreground">
                  {slot.timeSlot}
                </Text>
                <Text className="text-xs text-muted">
                  {slot.trades} trades
                </Text>
              </View>
              <Text
                className={`text-lg font-bold ${
                  slot.totalPnl >= 0 ? "text-success" : "text-error"
                }`}
              >
                {slot.totalPnl >= 0 ? "+" : ""}₹{slot.totalPnl.toFixed(2)}
              </Text>
            </View>

            {/* Metrics Grid */}
            <View className="flex-row gap-2">
              <View className="flex-1 bg-background rounded p-2">
                <Text className="text-xs text-muted">Win Rate</Text>
                <Text className="text-sm font-bold text-foreground">
                  {slot.winRate.toFixed(1)}%
                </Text>
              </View>
              <View className="flex-1 bg-background rounded p-2">
                <Text className="text-xs text-muted">Avg P&L</Text>
                <Text
                  className={`text-sm font-bold ${
                    slot.avgPnl >= 0 ? "text-success" : "text-error"
                  }`}
                >
                  ₹{slot.avgPnl.toFixed(2)}
                </Text>
              </View>
              <View className="flex-1 bg-background rounded p-2">
                <Text className="text-xs text-muted">W/L</Text>
                <Text className="text-sm font-bold text-foreground">
                  {slot.wins}/{slot.losses}
                </Text>
              </View>
            </View>

            {/* Progress Bar */}
            {slot.trades > 0 && (
              <View className="mt-3 h-2 bg-background rounded-full overflow-hidden flex-row">
                <View
                  style={{
                    width: `${(slot.wins / slot.trades) * 100}%`,
                  }}
                  className="bg-success"
                />
                <View
                  style={{
                    width: `${(slot.losses / slot.trades) * 100}%`,
                  }}
                  className="bg-error"
                />
              </View>
            )}
          </View>
        ))}

        {/* Insights */}
        <View className="bg-primary/10 border border-primary rounded-lg p-4 mt-6">
          <Text className="text-sm font-bold text-primary mb-2">💡 Insight</Text>
          <Text className="text-xs text-foreground leading-relaxed">
            {trades.length === 0
              ? "Log some trades to see time-of-day analysis."
              : `Your most profitable trading period is ${bestSlot.timeSlot.toLowerCase()}. Consider focusing your trading activity during these hours.`}
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
