/**
 * Export utilities for trading journal data
 */

export interface TradeRecord {
  id: number;
  symbol: string;
  entryDate: Date;
  entryPrice: string;
  exitDate: Date;
  exitPrice: string;
  quantity: string;
  tradeType: "long" | "short";
  pnl: string | null;
  pnlPercent: string | null;
  notes: string | null;
  tags: string | null;
}

/**
 * Convert trades to CSV format
 */
export function generateCSV(trades: TradeRecord[]): string {
  const headers = [
    "Symbol",
    "Trade Type",
    "Entry Date",
    "Entry Price",
    "Exit Date",
    "Exit Price",
    "Quantity",
    "P&L",
    "P&L %",
    "Notes",
    "Tags",
  ];

  const rows = trades.map((trade) => [
    trade.symbol,
    trade.tradeType,
    formatDate(new Date(trade.entryDate)),
    trade.entryPrice,
    formatDate(new Date(trade.exitDate)),
    trade.exitPrice,
    trade.quantity,
    trade.pnl || "0",
    trade.pnlPercent || "0",
    trade.notes || "",
    trade.tags || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) =>
          typeof cell === "string" && cell.includes(",")
            ? `"${cell}"`
            : cell
        )
        .join(",")
    ),
  ].join("\n");

  return csvContent;
}

/**
 * Generate a summary report as text (for PDF conversion)
 */
export function generateSummaryReport(trades: TradeRecord[]): string {
  if (trades.length === 0) {
    return "No trades to report.";
  }

  const totalPnl = trades.reduce(
    (sum, t) => sum + parseFloat(t.pnl || "0"),
    0
  );
  const winningTrades = trades.filter((t) => parseFloat(t.pnl || "0") > 0)
    .length;
  const losingTrades = trades.filter((t) => parseFloat(t.pnl || "0") < 0)
    .length;
  const winRate = ((winningTrades / trades.length) * 100).toFixed(2);

  let report = "TRADING JOURNAL REPORT\n";
  report += "=".repeat(50) + "\n\n";

  report += "SUMMARY\n";
  report += "-".repeat(50) + "\n";
  report += `Total Trades: ${trades.length}\n`;
  report += `Winning Trades: ${winningTrades}\n`;
  report += `Losing Trades: ${losingTrades}\n`;
  report += `Win Rate: ${winRate}%\n`;
  report += `Total P&L: ₹${totalPnl.toFixed(2)}\n\n`;

  report += "TRADES\n";
  report += "-".repeat(50) + "\n";

  trades.forEach((trade, index) => {
    const pnl = parseFloat(trade.pnl || "0");
    report += `\n${index + 1}. ${trade.symbol} - ${trade.tradeType.toUpperCase()}\n`;
    report += `   Entry: ₹${trade.entryPrice} on ${formatDate(
      new Date(trade.entryDate)
    )}\n`;
    report += `   Exit:  ₹${trade.exitPrice} on ${formatDate(
      new Date(trade.exitDate)
    )}\n`;
    report += `   Qty:   ${trade.quantity}\n`;
    report += `   P&L:   ₹${pnl.toFixed(2)} (${trade.pnlPercent || "0"}%)\n`;
    if (trade.notes) {
      report += `   Notes: ${trade.notes}\n`;
    }
  });

  return report;
}

/**
 * Format date to readable string
 */
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Download CSV file (for web/native)
 */
export async function downloadCSV(
  trades: TradeRecord[],
  filename: string = "trading-journal.csv"
): Promise<string> {
  const csv = generateCSV(trades);

  // For web platform
  if (typeof window !== "undefined") {
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return url;
  }

  // For native platforms, return the CSV content
  return csv;
}

/**
 * Share trades data
 */
export async function shareTradesData(
  trades: TradeRecord[],
  format: "csv" | "text" = "csv"
): Promise<string> {
  if (format === "csv") {
    return generateCSV(trades);
  } else {
    return generateSummaryReport(trades);
  }
}
