import { ThemedView } from "@/components/themed-view";
import { NoData } from "@/components/ui/no-data";
import { reportService } from "@/services/report.service";
import { RegularPioneerActivityItem, RegularPioneersActivityResponse } from "@/types/report.types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import * as Print from "expo-print";
import { router } from "expo-router";
import { shareAsync } from "expo-sharing";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  floatingCard: {
    ...Platform.select({
      ios: {
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      },
    }),
  },
});

const MaterialIcon = ({
  name,
  size = 24,
  color,
  className,
}: {
  name: string;
  size?: number;
  color?: string;
  className?: string;
}) => {
  return <MaterialIcons name={name as any} size={size} color={color} className={className} />;
};

const getPositionBadge = (position: number) => {
  switch (position) {
    case 1:
      return {
        bg: "bg-amber-100 dark:bg-amber-900/40",
        border: "border-amber-300 dark:border-amber-700",
        text: "text-amber-700 dark:text-amber-300",
        iconColor: "#d97706",
      };
    case 2:
      return {
        bg: "bg-slate-200 dark:bg-slate-700/60",
        border: "border-slate-300 dark:border-slate-600",
        text: "text-slate-700 dark:text-slate-200",
        iconColor: "#64748b",
      };
    case 3:
      return {
        bg: "bg-orange-100 dark:bg-orange-900/40",
        border: "border-orange-300 dark:border-orange-700",
        text: "text-orange-700 dark:text-orange-300",
        iconColor: "#ea580c",
      };
    default:
      return {
        bg: "bg-blue-50 dark:bg-blue-900/30",
        border: "border-blue-200 dark:border-blue-800",
        text: "text-blue-700 dark:text-blue-300",
        iconColor: "#2563eb",
      };
  }
};

export default function RegularPioneersActivityScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const now = new Date();
  const currentCalendarMonth = now.getMonth() + 1; // 1 - 12
  const currentCalendarYear = now.getFullYear();
  const currentServiceYear = currentCalendarMonth >= 9 ? currentCalendarYear + 1 : currentCalendarYear;

  // In September (9) or October (10), default to the service year that just ended (currentServiceYear - 1),
  // while allowing the user to easily switch to the new service year.
  const initialServiceYear =
    currentCalendarMonth === 9 || currentCalendarMonth === 10
      ? currentServiceYear - 1
      : currentServiceYear;

  const [selectedYear, setSelectedYear] = useState(initialServiceYear);
  const [data, setData] = useState<RegularPioneersActivityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivity = useCallback(
    async (year: number, isRefresh = false) => {
      try {
        if (isRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }
        setError(null);
        const response = await reportService.getRegularPioneersActivity(year);
        setData(response);
      } catch (err: any) {
        console.error("Error fetching regular pioneers activity:", err);
        setError("No se pudo cargar la información de actividad. Intenta de nuevo.");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [],
  );

  const generatePdf = useCallback(async () => {
    if (!data) return;
    setIsExporting(true);
    try {
      const pioneerRows = data.pioneers
        .map((p) => {
          const green = p.currentTotalHours > 599;
          return `
                <tr class="${green ? "green-row" : ""}">
                  <td>${p.firstName} ${p.lastName}</td>
                  <td class="num">${p.reportedMonths}</td>
                  <td class="num">${p.monthlyAverageHours} hrs</td>
                  <td class="num ${green ? "green-badge" : ""}">${p.currentTotalHours} hrs</td>
                </tr>`;
        })
        .join("");

      const html = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<title></title>
<style>
  /* Setting margin: 0 in @page eliminates the native iOS running header/footer area.
     Body padding handles the document margins instead. */
  @page {
    size: Letter;
    margin: 0;
  }
  html {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #1e293b; padding: 20mm 18mm; }
  h1 { font-size: 18px; font-weight: bold; color: #1e40af; margin-bottom: 2px; }
  .subtitle { font-size: 10px; color: #64748b; margin-bottom: 24px; }
  h2 { font-size: 13px; font-weight: bold; color: #1e293b; margin-bottom: 8px; margin-top: 20px; border-left: 3px solid #2563eb; padding-left: 8px; }
  /* Tables: allow breaking across pages, keep each row intact */
  table { width: 100%; border-collapse: collapse; margin-bottom: 8px; page-break-inside: auto; }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; break-inside: avoid; }
  th { background: #f1f5f9; color: #475569; font-size: 9px; text-transform: uppercase; letter-spacing: 0.05em; padding: 6px 8px; text-align: left; border-bottom: 1px solid #e2e8f0; }
  td { padding: 7px 8px; border-bottom: 1px solid #f1f5f9; color: #334155; }
  tr:last-child td { border-bottom: none; }
  .num { text-align: center; }
  .rank-pos { font-weight: bold; color: #2563eb; text-align: center; width: 40px; }
  .green-row { background: #f0fdf4; }
  .green-badge { font-weight: bold; color: #15803d; }
  .empty { text-align: center; color: #94a3b8; font-style: italic; padding: 12px; }
  .legend { margin-top: 8px; font-size: 9px; color: #64748b; }
  .legend span { display: inline-block; width: 10px; height: 10px; background: #bbf7d0; border-radius: 2px; margin-right: 4px; vertical-align: middle; }
  .footer { margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 8px; font-size: 9px; color: #94a3b8; text-align: center; page-break-inside: avoid; }
</style>
</head>
<body>
  <h1>Actividad de Precursores Regulares</h1>
  <div class="subtitle">Año de Servicio ${selectedYear} &nbsp;|&nbsp; Sep ${selectedYear - 1} – Ago ${selectedYear} &nbsp;|&nbsp; ${data.pioneers.length} precursor${data.pioneers.length !== 1 ? "es" : ""}</div>

  <h2>Tabla de Actividad</h2>
  <table>
    <thead>
      <tr><th>Nombre</th><th class="num">Meses</th><th class="num">Promedio/mes</th><th class="num">Total Horas</th></tr>
    </thead>
    <tbody>${pioneerRows}</tbody>
  </table>
  <div class="legend"><span></span>Verde: precursores con más de 599 horas acumuladas</div>

  <div class="footer">Generado el ${new Date().toLocaleDateString("es-MX", { day: "2-digit", month: "long", year: "numeric" })}</div>
</body>
</html>`;

      if (Platform.OS === "web") {
        // On web, expo-print would print the entire browser page (the app UI).
        // Instead, open a new tab with ONLY our HTML so the user can print to PDF from there.
        const blob = new Blob([html], { type: "text/html;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const win = window.open(url, "_blank");
        // Trigger the browser print dialog automatically once the page loads
        if (win) {
          win.onload = () => {
            win.focus();
            win.print();
          };
        }
        URL.revokeObjectURL(url);
      } else {
        // iOS / Android: printToFileAsync renders only our HTML string in an
        // isolated offscreen WebView — no app UI bleeds into the PDF.
        const { uri } = await Print.printToFileAsync({
          html,
          base64: false,
          // margins: 0 tells iOS UIPrintPageRenderer to reserve no space
          // for the native running header/footer, suppressing them entirely.
          margins: { top: 0, right: 0, bottom: 0, left: 0 },
        });
        await shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `Precursores Regulares – Año ${selectedYear}`,
          UTI: "com.adobe.pdf",
        });
      }
    } catch (err) {
      console.error("Error generando PDF:", err);
    } finally {
      setIsExporting(false);
    }
  }, [data, selectedYear]);

  useEffect(() => {
    fetchActivity(selectedYear);
  }, [fetchActivity, selectedYear]);

  return (
    <ThemedView className="flex-1">
      {/* Header */}
      <View
        className="z-50 bg-background-light dark:bg-card-dark border-b border-border-input-light dark:border-border-input-dark"
        style={{ paddingTop: insets.top + 14 }}
      >
        <View className="flex-row items-center px-4 pb-4 gap-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
          >
            <MaterialIcon name="arrow-back" size={24} color="#64748b" className="dark:text-slate-400" />
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold text-text-main-light dark:text-text-main-dark">
              Actividad de Precursores
            </Text>
            <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              Precursores Regulares • Año {selectedYear}
            </Text>
          </View>
          {/* PDF Export button */}
          <TouchableOpacity
            onPress={generatePdf}
            disabled={!data || isLoading || isExporting}
            className={`w-10 h-10 items-center justify-center rounded-full ${
              !data || isLoading || isExporting
                ? "bg-slate-100 dark:bg-slate-800 opacity-40"
                : "bg-red-50 dark:bg-red-900/30"
            }`}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color="#ef4444" />
            ) : (
              <MaterialIcon name="picture-as-pdf" size={22} color="#ef4444" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchActivity(selectedYear, true)}
            colors={["#2563eb"]}
            tintColor="#2563eb"
          />
        }
      >
        <View className="max-w-4xl mx-auto w-full gap-6">
          {/* Year Selector */}
          <View
            style={styles.floatingCard}
            className="bg-card-light dark:bg-card-dark rounded-2xl p-4 border border-border-input-light dark:border-border-input-dark flex-row items-center justify-between"
          >
            <View className="flex-row items-center gap-2.5">
              <View className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 items-center justify-center">
                <MaterialIcon name="date-range" size={20} color="#2563eb" />
              </View>
              <View>
                <Text className="text-xs font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                  Año de Servicio
                </Text>
                <Text className="text-[11px] text-text-secondary-light/80 dark:text-text-secondary-dark/80">
                  Sep {selectedYear - 1} - Ago {selectedYear}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-2 bg-surface-input-light dark:bg-surface-input-dark rounded-xl p-1 border border-border-input-light dark:border-border-input-dark">
              <TouchableOpacity
                onPress={() => setSelectedYear((prev) => prev - 1)}
                className="p-1.5 rounded-lg bg-card-light dark:bg-card-dark active:opacity-70 shadow-sm"
              >
                <MaterialIcon name="chevron-left" size={20} color="#64748b" className="dark:text-slate-400" />
              </TouchableOpacity>

              <Text className="font-bold text-base px-2 text-text-main-light dark:text-text-main-dark">
                {selectedYear}
              </Text>

              <TouchableOpacity
                onPress={() => setSelectedYear((prev) => prev + 1)}
                disabled={selectedYear >= currentServiceYear}
                className={`p-1.5 rounded-lg bg-card-light dark:bg-card-dark active:opacity-70 shadow-sm ${
                  selectedYear >= currentServiceYear ? "opacity-30" : ""
                }`}
              >
                <MaterialIcon
                  name="chevron-right"
                  size={20}
                  color={selectedYear >= currentServiceYear ? "#94a3b8" : "#2563eb"}
                />
              </TouchableOpacity>
            </View>
          </View>

          {isLoading ? (
            <View className="flex-1 items-center justify-center py-20">
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : error ? (
            <View className="flex-1 items-center justify-center py-16 px-4">
              <View className="bg-red-50 dark:bg-red-900/20 p-5 rounded-full mb-4">
                <MaterialIcon name="error-outline" size={48} color="#ef4444" />
              </View>
              <Text className="text-base font-semibold text-text-main-light dark:text-text-main-dark text-center mb-2">
                {error}
              </Text>
              <TouchableOpacity
                onPress={() => fetchActivity(selectedYear)}
                className="mt-4 px-5 py-2.5 bg-primary rounded-xl"
              >
                <Text className="text-white font-bold text-sm">Reintentar</Text>
              </TouchableOpacity>
            </View>
          ) : !data || data.pioneers.length === 0 ? (
            <NoData
              title={`No hay datos de precursores para el año ${selectedYear}`}
              icon="group-off"
            />
          ) : (
            <View className="gap-6">
              {/* Section A: Ranking de Precursores */}
              <View className="space-y-3">
                <View className="flex-row items-center justify-between mb-1">
                  <View className="flex-row items-center gap-2">
                    <View className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/30 items-center justify-center">
                      <MaterialIcon name="emoji-events" size={20} color="#d97706" />
                    </View>
                    <Text className="text-lg font-bold text-text-main-light dark:text-text-main-dark">
                      Ranking de Precursores
                    </Text>
                  </View>
                  <View className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                    <Text className="text-[11px] font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                      Top 5 • &gt; 560 hrs
                    </Text>
                  </View>
                </View>

                {data.ranking && data.ranking.length > 0 ? (
                  <View className="gap-2.5">
                    {data.ranking.map((item) => {
                      const badge = getPositionBadge(item.position);
                      return (
                        <View
                          key={item.id}
                          style={styles.floatingCard}
                          className="flex-row items-center justify-between p-3.5 bg-card-light dark:bg-card-dark rounded-xl border border-border-input-light dark:border-border-input-dark"
                        >
                          <View className="flex-row items-center gap-3 flex-1 pr-2">
                            <View
                              className={`w-9 h-9 rounded-xl ${badge.bg} border ${badge.border} items-center justify-center`}
                            >
                              <Text className={`font-bold text-sm ${badge.text}`}>
                                #{item.position}
                              </Text>
                            </View>
                            <View className="flex-1">
                              <Text
                                className="font-bold text-sm text-text-main-light dark:text-text-main-dark"
                                numberOfLines={1}
                              >
                                {item.firstName} {item.lastName}
                              </Text>
                              <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                Precursor Regular
                              </Text>
                            </View>
                          </View>
                          <View className="items-end bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-900/40">
                            <Text className="font-extrabold text-base text-primary dark:text-blue-400">
                              {item.currentTotalHours}
                            </Text>
                            <Text className="text-[10px] font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-tight">
                              Horas
                            </Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <View
                    style={styles.floatingCard}
                    className="p-5 bg-card-light dark:bg-card-dark rounded-xl border border-border-input-light dark:border-border-input-dark flex-row items-center gap-3.5"
                  >
                    <View className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 items-center justify-center">
                      <MaterialIcon name="info-outline" size={22} color="#64748b" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-semibold text-sm text-text-main-light dark:text-text-main-dark">
                        Sin precursores en el ranking
                      </Text>
                      <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                        Ningún precursor regular supera las 560 horas acumuladas para el año {selectedYear}.
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Section B: Tabla de actividad */}
              <View className="space-y-3">
                <View className="flex-row items-center justify-between mb-1">
                  <View className="flex-row items-center gap-2">
                    <View className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 items-center justify-center">
                      <MaterialIcon name="table-chart" size={20} color="#2563eb" />
                    </View>
                    <Text className="text-lg font-bold text-text-main-light dark:text-text-main-dark">
                      Tabla de Actividad
                    </Text>
                  </View>
                  <View className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800">
                    <Text className="text-[11px] font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                      {data.pioneers.length} {data.pioneers.length === 1 ? "precursor" : "precursores"}
                    </Text>
                  </View>
                </View>

                {/* Table Container */}
                <View
                  style={styles.floatingCard}
                  className="bg-card-light dark:bg-card-dark rounded-2xl border border-border-input-light dark:border-border-input-dark overflow-hidden"
                >
                  {/* Table Header */}
                  <View className="flex-row items-center bg-slate-50 dark:bg-slate-800/60 p-3.5 border-b border-border-input-light dark:border-border-input-dark">
                    <Text className="flex-1 font-bold text-xs text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                      Nombre
                    </Text>
                    <Text className="w-16 text-center font-bold text-xs text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                      Meses
                    </Text>
                    <Text className="w-20 text-center font-bold text-xs text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                      Promedio
                    </Text>
                    <Text className="w-20 text-right font-bold text-xs text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                      Total
                    </Text>
                  </View>

                  {/* Table Rows */}
                  {data.pioneers.map((pioneer: RegularPioneerActivityItem, index: number) => {
                    const isGreenHighlighted = pioneer.currentTotalHours > 599;
                    const isLast = index === data.pioneers.length - 1;

                    return (
                      <View
                        key={pioneer.id}
                        className={`flex-row items-center p-3.5 ${!isLast ? "border-b border-border-input-light dark:border-border-input-dark" : ""} ${
                          isGreenHighlighted ? "bg-green-50/80 dark:bg-green-950/30" : ""
                        }`}
                      >
                        {/* Nombre */}
                        <View className="flex-1 pr-2">
                          <Text
                            className={`font-semibold text-sm ${
                              isGreenHighlighted
                                ? "text-green-900 dark:text-green-200"
                                : "text-text-main-light dark:text-text-main-dark"
                            }`}
                            numberOfLines={1}
                          >
                            {pioneer.firstName} {pioneer.lastName}
                          </Text>
                        </View>

                        {/* Meses informados */}
                        <View className="w-16 items-center">
                          <Text
                            className={`text-xs font-semibold ${
                              isGreenHighlighted
                                ? "text-green-800 dark:text-green-300"
                                : "text-text-secondary-light dark:text-text-secondary-dark"
                            }`}
                          >
                            {pioneer.reportedMonths}
                          </Text>
                        </View>

                        {/* Promedio mensual */}
                        <View className="w-20 items-center">
                          <Text
                            className={`text-xs font-semibold ${
                              isGreenHighlighted
                                ? "text-green-800 dark:text-green-300"
                                : "text-text-secondary-light dark:text-text-secondary-dark"
                            }`}
                          >
                            {pioneer.monthlyAverageHours}h
                          </Text>
                        </View>

                        {/* Total Horas Actual */}
                        <View className="w-20 items-end">
                          {isGreenHighlighted ? (
                            <View className="px-2 py-0.5 rounded-full bg-green-200/70 dark:bg-green-900/60 border border-green-300 dark:border-green-700">
                              <Text className="font-bold text-xs text-green-800 dark:text-green-300">
                                {pioneer.currentTotalHours}h
                              </Text>
                            </View>
                          ) : (
                            <Text className="font-bold text-xs text-text-main-light dark:text-text-main-dark">
                              {pioneer.currentTotalHours}h
                            </Text>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>

                {/* Legend */}
                <View className="flex-row items-center gap-2 px-1 pt-1">
                  <View className="w-3 h-3 rounded-full bg-green-500" />
                  <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    Resaltado en verde: Precursores con más de 599 horas acumuladas
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}
