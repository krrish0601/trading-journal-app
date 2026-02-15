import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { trpc } from "@/lib/trpc";
import { generateCSV, generateSummaryReport } from "@/lib/export-utils";
import { useState } from "react";
import * as FileSystem from "expo-file-system/legacy";
import { Platform } from "react-native";

export default function ExportTradesScreen() {
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);

  const { data: trades = [] } = trpc.trades.list.useQuery();

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);

      const csv = generateCSV(trades);
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `trading-journal-${timestamp}.csv`;

      if (Platform.OS === "web") {
        // Web: trigger download
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a") as any;
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = filename;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
        Alert.alert("Success", "CSV file downloaded");
      } else {
        // Native: share the file
        const fileUri = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(fileUri, csv);

        await Share.share({
          url: fileUri,
          title: "Trading Journal",
          message: "Here is your trading journal export",
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to export CSV");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);

      const report = generateSummaryReport(trades);
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `trading-journal-${timestamp}.txt`;

      if (Platform.OS === "web") {
        // Web: trigger download as text (can be converted to PDF by user)
        const blob = new Blob([report], { type: "text/plain;charset=utf-8;" });
        const link = document.createElement("a") as any;
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.download = filename;
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }, 100);
        Alert.alert("Success", "Report downloaded as text file");
      } else {
        // Native: share the file
        const fileUri = `${FileSystem.documentDirectory}${filename}`;
        await FileSystem.writeAsStringAsync(fileUri, report);

        await Share.share({
          url: fileUri,
          title: "Trading Journal Report",
          message: "Here is your trading journal report",
        });
      }
    } catch (error) {
      Alert.alert("Error", "Failed to export report");
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareCSV = async () => {
    try {
      const csv = generateCSV(trades);
      await Share.share({
        message: csv,
        title: "Trading Journal CSV",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share CSV");
    }
  };

  const handleShareReport = async () => {
    try {
      const report = generateSummaryReport(trades);
      await Share.share({
        message: report,
        title: "Trading Journal Report",
      });
    } catch (error) {
      Alert.alert("Error", "Failed to share report");
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-3xl font-bold text-foreground">
            Export Trades
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-primary font-semibold">Close</Text>
          </TouchableOpacity>
        </View>

        {/* Summary */}
        <View className="bg-surface rounded-lg p-4 mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">
            Summary
          </Text>
          <View className="space-y-2">
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Total Trades</Text>
              <Text className="text-sm font-bold text-foreground">
                {trades.length}
              </Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-muted">Date Range</Text>
              <Text className="text-sm font-semibold text-foreground">
                {trades.length > 0
                  ? `${new Date(trades[trades.length - 1].entryDate).toLocaleDateString()} - ${new Date(trades[0].entryDate).toLocaleDateString()}`
                  : "N/A"}
              </Text>
            </View>
            <View className="flex-row justify-between pt-2 border-t border-border">
              <Text className="text-sm text-muted">Total P&L</Text>
              <Text
                className={`text-sm font-bold ${
                  trades.reduce(
                    (sum, t) => sum + parseFloat(t.pnl || "0"),
                    0
                  ) >= 0
                    ? "text-success"
                    : "text-error"
                }`}
              >
                ₹
                {trades
                  .reduce((sum, t) => sum + parseFloat(t.pnl || "0"), 0)
                  .toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Export Options */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-4">
            Export Options
          </Text>

          {/* CSV Export */}
          <View className="bg-surface rounded-lg p-4 mb-4">
            <Text className="text-base font-bold text-foreground mb-2">
              CSV Format
            </Text>
            <Text className="text-sm text-muted mb-4">
              Export all trades as a CSV file for spreadsheet applications
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={handleExportCSV}
                disabled={isExporting || trades.length === 0}
                className="flex-1 bg-primary py-3 rounded-lg items-center"
              >
                {isExporting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-background font-bold">
                    Download CSV
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleShareCSV}
                disabled={trades.length === 0}
                className="flex-1 bg-primary/20 py-3 rounded-lg items-center"
              >
                <Text className="text-primary font-bold">Share</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* PDF/Report Export */}
          <View className="bg-surface rounded-lg p-4">
            <Text className="text-base font-bold text-foreground mb-2">
              Report Format
            </Text>
            <Text className="text-sm text-muted mb-4">
              Export a summary report with statistics and analysis
            </Text>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={handleExportPDF}
                disabled={isExporting || trades.length === 0}
                className="flex-1 bg-primary py-3 rounded-lg items-center"
              >
                {isExporting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-background font-bold">
                    Download Report
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleShareReport}
                disabled={trades.length === 0}
                className="flex-1 bg-primary/20 py-3 rounded-lg items-center"
              >
                <Text className="text-primary font-bold">Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Info */}
        {trades.length === 0 && (
          <View className="bg-warning/10 rounded-lg p-4 mb-6">
            <Text className="text-sm text-warning font-semibold mb-1">
              No Trades
            </Text>
            <Text className="text-xs text-muted">
              You need to log at least one trade to export data
            </Text>
          </View>
        )}

        {/* Instructions */}
        <View className="bg-surface rounded-lg p-4">
          <Text className="text-base font-bold text-foreground mb-3">
            Instructions
          </Text>
          <Text className="text-sm text-muted leading-relaxed">
            {`• CSV files can be opened in Excel, Google Sheets, or any spreadsheet application\n\n• Report files contain a summary of your trading performance\n\n• Use the Share button to send files via email or messaging apps\n\n• Downloaded files are saved to your device's download folder`}
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
