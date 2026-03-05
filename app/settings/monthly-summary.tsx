import { useSession } from "@/components/ctx";
import { ThemedView } from "@/components/themed-view";
import { reportService } from "@/services/report.service";
import { ReportCongregationHome } from "@/types/report.types";
import { getInitialPeriod } from "@/utils/date.utils";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
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

const MaterialIcon = ({ name, size = 24, color, className }: { name: string; size?: number; color?: string; className?: string }) => {
  return <MaterialIcons name={name as any} size={size} color={color} className={className} />;
};

const MONTHS = [
  { label: "Enero", value: 1 },
  { label: "Febrero", value: 2 },
  { label: "Marzo", value: 3 },
  { label: "Abril", value: 4 },
  { label: "Mayo", value: 5 },
  { label: "Junio", value: 6 },
  { label: "Julio", value: 7 },
  { label: "Agosto", value: 8 },
  { label: "Septiembre", value: 9 },
  { label: "Octubre", value: 10 },
  { label: "Noviembre", value: 11 },
  { label: "Diciembre", value: 12 },
];

export default function MonthlySummaryScreen() {
  const { user } = useSession();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 560;

  const initialPeriod = getInitialPeriod();
  const [selectedMonth, setSelectedMonth] = useState(initialPeriod.month - 1);
  const [selectedYear, setSelectedYear] = useState(initialPeriod.year);
  const [homeData, setHomeData] = useState<ReportCongregationHome | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const years = Array.from({ length: 2 }, (_, i) => new Date().getFullYear() - 1 + i);

  const fetchSummary = useCallback(async () => {
    if (!user?.congregation_id) return;
    try {
      setIsLoading(true);
      const data = await reportService.getReportCongregationHome({
        congregation_id: user.congregation_id,
        year: selectedYear,
        month: selectedMonth,
      });
      setHomeData(data);
    } catch (error) {
      console.error("Error fetching monthly summary:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.congregation_id, selectedMonth, selectedYear]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const getPercentage = () => {
    if (!homeData || homeData.expected_reports === 0) return 0;
    return (homeData.registered_reports / homeData.expected_reports) * 100;
  };

  const getMonthName = (month: number) => {
    return MONTHS.find((m) => m.value === month)?.label || "";
  };

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
          <Text className="text-xl font-bold text-text-main-light dark:text-text-main-dark">Resumen mensual</Text>
        </View>

        {/* Filters */}
        <View className="px-4 pb-4 flex-row gap-3">
          <View className="flex-1">
            <Text className="text-[10px] font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase mb-1 ml-1">Mes</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
              <View className="flex-row gap-2">
                {MONTHS.map((m) => (
                  <TouchableOpacity
                    key={m.value}
                    onPress={() => setSelectedMonth(m.value)}
                    className={`px-4 py-2 rounded-xl border ${selectedMonth === m.value ? "bg-primary border-primary" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"}`}
                  >
                    <Text
                      className={`text-xs font-bold ${selectedMonth === m.value ? "text-white" : "text-text-secondary-light dark:text-text-secondary-dark"}`}
                    >
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
        <View className="px-4 pb-4">
          <Text className="text-[10px] font-bold text-text-secondary-light dark:text-text-secondary-dark uppercase mb-1 ml-1">Año</Text>
          <View className="flex-row gap-2">
            {years.map((y) => (
              <TouchableOpacity
                key={y}
                onPress={() => setSelectedYear(y)}
                className={`px-4 py-2 rounded-xl border ${selectedYear === y ? "bg-primary border-primary" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"}`}
              >
                <Text
                  className={`text-xs font-bold ${selectedYear === y ? "text-white" : "text-text-secondary-light dark:text-text-secondary-dark"}`}
                >
                  {y}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {isLoading ? (
          <View className="flex-1 items-center justify-center py-20">
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : (
          <View className="max-w-2xl mx-auto w-full gap-6">
            {/* Reports Card */}
            <View className="overflow-hidden rounded-2xl bg-sky-500 p-6 shadow-xl relative border border-sky-400/20">
              <View
                className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full"
                style={{ transform: [{ scale: 1.5 }] }}
              />
              <View
                className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-sky-300/20 rounded-full"
                style={{ transform: [{ scale: 1.2 }] }}
              />

              <View className="z-10">
                <Text className="text-white text-[10px] font-bold uppercase tracking-widest mb-1">
                  Resumen de {getMonthName(selectedMonth)} {selectedYear}
                </Text>
                <View className="flex-row items-baseline mb-4">
                  <Text className="text-white text-4xl font-bold">
                    {homeData?.registered_reports} de {homeData?.expected_reports}{" "}
                  </Text>
                  <Text className="text-sky-100 ml-1 text-lg font-medium">informes</Text>
                </View>

                <View className="gap-2">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-[10px] text-sky-100 font-bold uppercase">Progreso del registro</Text>
                    <Text className="text-xs text-white font-bold">{getPercentage().toFixed(0)}%</Text>
                  </View>
                  <View className="h-2.5 w-full bg-black/20 rounded-full overflow-hidden border border-white/10">
                    <View className="h-full bg-white rounded-full" style={{ width: `${getPercentage()}%` }} />
                  </View>
                </View>
              </View>
            </View>

            {/* Predication Summary Section */}
            <View className="gap-4">
              <Text className="text-lg font-bold text-text-main-light dark:text-text-main-dark">Resumen de predicación</Text>
              <View className={`flex-row flex-wrap gap-2 pb-3 ${isSmallScreen ? "flex-col" : "flex-row"}`}>
                {/* Publicadores */}
                <View
                  style={styles.floatingCard}
                  className={`${isSmallScreen ? "w-full" : "flex-1"} rounded-xl p-4 bg-card-light dark:bg-card-dark border border-border-input-light dark:border-border-input-dark`}
                >
                  <View className="flex-row items-center gap-2 mb-3">
                    <View className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                      <MaterialIcon name="description" size={18} color="#3b82f6" />
                    </View>
                    <Text className="text-sm font-bold text-text-main-light dark:text-text-main-dark">Publicadores</Text>
                  </View>
                  <View className="gap-2">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs">Informes</Text>
                      <Text className="text-sm font-bold text-text-main-light dark:text-text-main-dark">
                        {homeData?.summary?.publishers?.reports || 0}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs">Cursos bíblicos</Text>
                      <Text className="text-sm font-bold text-text-main-light dark:text-text-main-dark">
                        {homeData?.summary?.publishers?.bible_courses || 0}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Auxiliares */}
                <View
                  style={styles.floatingCard}
                  className={`${isSmallScreen ? "w-full" : "flex-1"} rounded-xl p-4 bg-card-light dark:bg-card-dark border border-border-input-light dark:border-border-input-dark`}
                >
                  <View className="flex-row items-center gap-2 mb-3">
                    <View className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                      <MaterialIcon name="access-time" size={18} color="#f59e0b" />
                    </View>
                    <Text className="text-sm font-bold text-text-main-light dark:text-text-main-dark">Auxiliares</Text>
                  </View>
                  <View className="gap-2">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs">Informes</Text>
                      <Text className="text-sm font-bold text-text-main-light dark:text-text-main-dark">
                        {homeData?.summary?.auxiliary_pioneers?.reports || 0}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs">Horas</Text>
                      <Text className="text-sm font-bold text-text-main-light dark:text-text-main-dark">
                        {homeData?.summary?.auxiliary_pioneers?.hours || 0}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs">Cursos bíblicos</Text>
                      <Text className="text-sm font-bold text-text-main-light dark:text-text-main-dark">
                        {homeData?.summary?.auxiliary_pioneers?.bible_courses || 0}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Regulares */}
                <View
                  style={styles.floatingCard}
                  className={`${isSmallScreen ? "w-full" : "flex-1"} rounded-xl p-4 bg-card-light dark:bg-card-dark border border-border-input-light dark:border-border-input-dark`}
                >
                  <View className="flex-row items-center gap-2 mb-3">
                    <View className="p-2 bg-teal-50 dark:bg-teal-900/30 rounded-lg">
                      <MaterialIcon name="verified" size={18} color="#14b8a6" />
                    </View>
                    <Text className="text-sm font-bold text-text-main-light dark:text-text-main-dark">Regulares</Text>
                  </View>
                  <View className="gap-2">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs">Informes</Text>
                      <Text className="text-sm font-bold text-text-main-light dark:text-text-main-dark">
                        {homeData?.summary?.regular_pioneers?.reports || 0}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs">Horas</Text>
                      <Text className="text-sm font-bold text-text-main-light dark:text-text-main-dark">
                        {homeData?.summary?.regular_pioneers?.hours || 0}
                      </Text>
                    </View>
                    <View className="flex-row justify-between items-center">
                      <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs">Cursos bíblicos</Text>
                      <Text className="text-sm font-bold text-text-main-light dark:text-text-main-dark">
                        {homeData?.summary?.regular_pioneers?.bible_courses || 0}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}
