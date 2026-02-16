import { View, Text, Dimensions } from "react-native";
import { useColors } from "@/hooks/use-colors";

interface EquityCurveProps {
  trades: Array<{
    id: number;
    entryDate: Date;
    pnl: string | null;
  }>;
  height?: number;
}

export function EquityCurve({ trades, height = 250 }: EquityCurveProps) {
  const colors = useColors();
  const screenWidth = Dimensions.get("window").width;
  const width = screenWidth - 32; // Account for padding

  // Calculate cumulative P&L
  let cumulativePnl = 0;
  const points = trades
    .sort((a, b) => new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime())
    .map((trade) => {
      cumulativePnl += parseFloat(trade.pnl || "0");
      return cumulativePnl;
    });

  if (points.length === 0) {
    return (
      <View className="bg-surface rounded-lg p-4 items-center justify-center" style={{ height }}>
        <Text className="text-sm text-muted">No trades yet</Text>
      </View>
    );
  }

  // Find min and max for scaling
  const minPnl = Math.min(...points, 0);
  const maxPnl = Math.max(...points, 0);
  const range = maxPnl - minPnl || 1;
  const padding = 40;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  // Calculate points for SVG path
  const svgPoints = points
    .map((pnl, index) => {
      const x = padding + (index / Math.max(points.length - 1, 1)) * graphWidth;
      const y = height - padding - ((pnl - minPnl) / range) * graphHeight;
      return `${x},${y}`;
    })
    .join(" ");

  // Find current P&L and status
  const currentPnl = points[points.length - 1];
  const isProfit = currentPnl >= 0;
  const pnlColor = isProfit ? colors.success : colors.error;

  // Calculate highest and lowest points
  const highestPnl = Math.max(...points);
  const lowestPnl = Math.min(...points);
  const drawdown = highestPnl - lowestPnl;

  return (
    <View className="bg-surface rounded-lg p-4 border border-border">
      <View className="flex-row justify-between items-start mb-4">
        <View>
          <Text className="text-sm text-muted mb-1">Equity Curve</Text>
          <Text className={`text-2xl font-bold ${isProfit ? "text-success" : "text-error"}`}>
            ₹{currentPnl.toFixed(2)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-xs text-muted mb-1">Trades</Text>
          <Text className="text-lg font-bold text-foreground">{points.length}</Text>
        </View>
      </View>

      {/* SVG Chart */}
      <View style={{ height, backgroundColor: "transparent" }}>
        <svg width={width} height={height} style={{ overflow: "visible" }}>
          {/* Grid lines */}
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke={colors.border}
            strokeWidth="1"
          />

          {/* Zero line */}
          {minPnl < 0 && maxPnl > 0 && (
            <line
              x1={padding}
              y1={height - padding - ((0 - minPnl) / range) * graphHeight}
              x2={width - padding}
              y2={height - padding - ((0 - minPnl) / range) * graphHeight}
              stroke={colors.muted}
              strokeWidth="1"
              strokeDasharray="4"
            />
          )}

          {/* Curve area (gradient effect with opacity) */}
          <polyline
            points={svgPoints}
            fill="none"
            stroke={pnlColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((pnl, index) => {
            const x = padding + (index / Math.max(points.length - 1, 1)) * graphWidth;
            const y = height - padding - ((pnl - minPnl) / range) * graphHeight;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill={pnl >= 0 ? colors.success : colors.error}
                opacity={index === points.length - 1 ? 1 : 0.5}
              />
            );
          })}

          {/* Y-axis labels */}
          <text x={padding - 10} y={height - padding + 15} fontSize="12" fill={colors.muted} textAnchor="end">
            ₹{minPnl.toFixed(0)}
          </text>
          <text x={padding - 10} y={padding + 5} fontSize="12" fill={colors.muted} textAnchor="end">
            ₹{maxPnl.toFixed(0)}
          </text>
        </svg>
      </View>

      {/* Statistics */}
      <View className="flex-row gap-2 mt-4">
        <View className="flex-1 bg-background rounded p-2">
          <Text className="text-xs text-muted">Highest</Text>
          <Text className="text-sm font-bold text-success">₹{highestPnl.toFixed(2)}</Text>
        </View>
        <View className="flex-1 bg-background rounded p-2">
          <Text className="text-xs text-muted">Lowest</Text>
          <Text className="text-sm font-bold text-error">₹{lowestPnl.toFixed(2)}</Text>
        </View>
        <View className="flex-1 bg-background rounded p-2">
          <Text className="text-xs text-muted">Drawdown</Text>
          <Text className="text-sm font-bold text-foreground">₹{drawdown.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
}
