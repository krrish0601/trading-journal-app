import { View, Text, Dimensions } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface PerformanceChartProps {
  data: { date: string; pnl: number }[];
  title?: string;
}

export function PerformanceChart({ data, title }: PerformanceChartProps) {
  const colors = useColors();
  const width = Dimensions.get("window").width - 32;
  const height = 200;
  const padding = 20;

  if (data.length === 0) {
    return (
      <View className="bg-surface rounded-lg p-4 mb-6">
        {title && (
          <Text className="text-lg font-bold text-foreground mb-4">
            {title}
          </Text>
        )}
        <View className="h-40 items-center justify-center">
          <Text className="text-muted">No data available</Text>
        </View>
      </View>
    );
  }

  // Calculate min/max for scaling
  const pnlValues = data.map((d) => d.pnl);
  const minPnl = Math.min(...pnlValues, 0);
  const maxPnl = Math.max(...pnlValues, 0);
  const range = maxPnl - minPnl || 1;

  // Calculate points for the chart
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const pointSpacing = chartWidth / (data.length - 1 || 1);

  const points = data.map((d, i) => {
    const x = padding + i * pointSpacing;
    const y = padding + chartHeight - ((d.pnl - minPnl) / range) * chartHeight;
    return { x, y, pnl: d.pnl };
  });

  // Create SVG path for the line
  const pathData = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  // Calculate cumulative P&L
  let cumulative = 0;
  const cumulativeData = data.map((d) => {
    cumulative += d.pnl;
    return cumulative;
  });

  const maxCumulative = Math.max(...cumulativeData, 0);
  const minCumulative = Math.min(...cumulativeData, 0);
  const cumulativeRange = maxCumulative - minCumulative || 1;

  const cumulativePoints = cumulativeData.map((c, i) => {
    const x = padding + i * pointSpacing;
    const y =
      padding +
      chartHeight -
      ((c - minCumulative) / cumulativeRange) * chartHeight;
    return { x, y };
  });

  const cumulativePathData = cumulativePoints
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <View className="bg-surface rounded-lg p-4 mb-6">
      {title && (
        <Text className="text-lg font-bold text-foreground mb-4">
          {title}
        </Text>
      )}

      {/* Simple ASCII-style chart */}
      <View className="bg-background rounded p-3 mb-4">
        <View style={{ height: chartHeight, position: "relative" }}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <View
              key={`grid-${ratio}`}
              style={{
                position: "absolute",
                top: padding + chartHeight * ratio,
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: colors.border,
                opacity: 0.3,
              }}
            />
          ))}

          {/* Data points */}
          {cumulativePoints.map((p, i) => (
            <View
              key={`point-${i}`}
              style={{
                position: "absolute",
                left: p.x - 4,
                top: p.y - 4,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: cumulativeData[i] >= 0 ? colors.success : colors.error,
              }}
            />
          ))}

          {/* Connecting lines (visual representation) */}
          {cumulativePoints.length > 1 && (
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            >
              {cumulativePoints.map((p, i) => {
                if (i === 0) return null;
                const prevP = cumulativePoints[i - 1];
                const slope = (p.y - prevP.y) / (p.x - prevP.x);
                const angle = Math.atan(slope);
                const distance = Math.sqrt(
                  Math.pow(p.x - prevP.x, 2) + Math.pow(p.y - prevP.y, 2)
                );

                return (
                  <View
                    key={`line-${i}`}
                    style={{
                      position: "absolute",
                      left: prevP.x,
                      top: prevP.y,
                      width: distance,
                      height: 2,
                      backgroundColor:
                        cumulativeData[i] >= 0 ? colors.success : colors.error,
                      transform: [{ rotate: `${angle}rad` }],
                      transformOrigin: "0 0",
                    }}
                  />
                );
              })}
            </View>
          )}
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row justify-between">
        <View>
          <Text className="text-xs text-muted">Total P&L</Text>
          <Text
            className={`text-lg font-bold ${
              cumulative >= 0 ? "text-success" : "text-error"
            }`}
          >
            {cumulative >= 0 ? "+" : ""}
            {cumulative.toFixed(2)}
          </Text>
        </View>
        <View>
          <Text className="text-xs text-muted">Trades</Text>
          <Text className="text-lg font-bold text-foreground">
            {data.length}
          </Text>
        </View>
        <View>
          <Text className="text-xs text-muted">Avg Trade</Text>
          <Text className="text-lg font-bold text-foreground">
            {(cumulative / data.length).toFixed(2)}
          </Text>
        </View>
      </View>
    </View>
  );
}
