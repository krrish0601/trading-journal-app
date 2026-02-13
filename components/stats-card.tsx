import { Text, View } from "react-native";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  variant?: "default" | "success" | "error";
}

export function StatsCard({
  label,
  value,
  subtext,
  variant = "default",
}: StatsCardProps) {
  const bgColor = {
    default: "bg-surface",
    success: "bg-success/10",
    error: "bg-error/10",
  }[variant];

  const textColor = {
    default: "text-foreground",
    success: "text-success",
    error: "text-error",
  }[variant];

  return (
    <View className={cn("rounded-lg p-4 flex-1", bgColor)}>
      <Text className="text-xs text-muted mb-2 uppercase font-semibold">
        {label}
      </Text>
      <Text className={cn("text-2xl font-bold", textColor)}>
        {value}
      </Text>
      {subtext && (
        <Text className="text-xs text-muted mt-1">{subtext}</Text>
      )}
    </View>
  );
}
