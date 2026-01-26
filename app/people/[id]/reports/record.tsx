import { ShowAlert } from "@/components/alert";
import { Loading } from "@/components/ui/loading";
import { NoData } from "@/components/ui/no-data";
import { personService } from "@/services/person.service";
import { publisherReportService } from "@/services/publisher-report.service";
import { Person } from "@/types/person.types";
import { PublisherReport } from "@/types/publisher-report.types";
import { MaterialIcons } from "@expo/vector-icons";
import { Link, router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { ScrollView, Text, TouchableOpacity, useColorScheme, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const getBadgeStyles = (dept: string) => {
  switch (dept) {
    case "is_regular_pioneer":
      return "bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800";
    case "is_elder":
      return "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800";
    case "is_ministerial_servant":
      return "bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800";
    case "is_special_pioneer":
      return "bg-rose-100 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800";
    case "is_field_missionary":
      return "bg-rose-100 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800";
    default:
      return "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700";
  }
};

const getBadgeTextStyles = (dept: string) => {
  switch (dept) {
    case "is_regular_pioneer":
      return "text-green-700 dark:text-green-400";
    case "is_elder":
      return "text-blue-700 dark:text-blue-400";
    case "is_ministerial_servant":
      return "text-blue-700 dark:text-blue-400";
    case "is_special_pioneer":
      return "text-rose-700 dark:text-rose-400";
    case "is_field_missionary":
      return "text-rose-700 dark:text-rose-400";
    default:
      return "text-slate-700 dark:text-slate-400";
  }
};

const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const shortMonthNames = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SEP", "OCT", "NOV", "DIC"];

const monthsOrder = [9, 10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8];

const months = (currentYear: number): { month: number; serviceYear: number }[] => {
  return [
    { month: 9, serviceYear: currentYear + 1 },
    { month: 10, serviceYear: currentYear + 1 },
    { month: 11, serviceYear: currentYear + 1 },
    { month: 12, serviceYear: currentYear + 1 },
    { month: 1, serviceYear: currentYear },
    { month: 2, serviceYear: currentYear },
    { month: 3, serviceYear: currentYear },
    { month: 4, serviceYear: currentYear },
    { month: 5, serviceYear: currentYear },
    { month: 6, serviceYear: currentYear },
    { month: 7, serviceYear: currentYear },
    { month: 8, serviceYear: currentYear },
  ];
};

const now = new Date();
const currentMonth = now.getMonth() + 1;
const currentYear = now.getFullYear();
const day = now.getDate();

const getInitialPeriod = () => {
  if (day >= 1 && day <= 20) {
    if (currentMonth === 1) {
      return { month: 12, year: currentYear - 1 };
    }
    return { month: currentMonth - 1, year: currentYear };
  }
  return { month: currentMonth, year: currentYear };
};

export default function ReportHistoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const [person, setPerson] = useState<Person | null>(null);
  const [reports, setReports] = useState<(PublisherReport & { isCurrent?: boolean; isFuture?: boolean })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const fetchData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const [personData, reportsData] = await Promise.all([
        personService.getPersonById(id),
        publisherReportService.getPublisherReportsByPersonId({ person_id: id, service_year: selectedYear }),
      ]);
      setPerson(personData);

      if (reportsData.length === 0 && selectedYear < currentYear) {
        setReports([]);
        return;
      }

      const reportsByMonth = reportsData.reduce(
        (acc, report) => {
          acc[report.month] = report;
          return acc;
        },
        {} as Record<number, PublisherReport>,
      );

      const { month: initialMonth, year: initialYear } = getInitialPeriod();

      const orderedReports = monthsOrder.map((month) => {
        const report = reportsByMonth[month];
        if (report) return report;
        const monthData = months(selectedYear).find((m) => m.month === month);

        return {
          id: Math.random(),
          service_year: monthData?.serviceYear,
          year: initialYear,
          month,
          hours: 0,
          bible_courses: 0,
          participated: false,
          person_id: +id,
          isCurrent: month === initialMonth,
          isFuture: monthsOrder.indexOf(month) > monthsOrder.indexOf(initialMonth) && selectedYear === monthData?.serviceYear,
          is_auxiliary_pioneer: false,
        };
      });

      setReports(orderedReports);
    } catch (error) {
      if (error instanceof Error && error.message === "Unauthorized") {
        ShowAlert("Error", error.message);
      } else {
        ShowAlert("Error", "No se pudo obtener el historial");
      }
    } finally {
      setIsLoading(false);
    }
  }, [id, selectedYear]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const totalHours = reports.reduce((sum, r) => sum + (r.hours || 0), 0);
  const averageHours = reports.length > 0 ? (totalHours / reports.length).toFixed(1) : "0.0";

  if (isLoading) return <Loading />;
  if (!person) return null;

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark" style={{ paddingTop: insets.top }}>
      {/* Header with Back Button (Replacing custom nav from HTML) */}
      <View className="bg-background-light/95 dark:bg-card-dark/95 border-b border-border-input-light dark:border-border-input-dark z-50">
        <View className="flex-row items-center justify-between px-4 h-[60px]">
          <TouchableOpacity onPress={() => router.back()} className="flex-row items-center gap-1 active:opacity-60">
            <MaterialIcons name="chevron-left" size={28} color="#2563eb" />
            <Text className="text-primary text-[17px] font-normal">Atrás</Text>
          </TouchableOpacity>
          <Text
            className="text-[17px] font-semibold text-center text-text-main-light dark:text-text-main-dark absolute left-1/2 -translate-x-1/2"
            numberOfLines={1}
          >
            Registro
          </Text>
          <TouchableOpacity onPress={() => router.push(`/people/${id}?edit=true`)} className="active:opacity-60">
            <Text className="text-primary text-[17px] font-normal">Editar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Person Header */}
        <View className="flex-row items-center gap-4 mb-6">
          <View
            className={`h-16 w-16 rounded-full items-center justify-center shadow-sm ${
              person.sex === "MALE" ? "bg-blue-400" : "bg-pink-400"
            }`}
          >
            <Text className="text-white font-bold text-2xl">
              {person.first_name?.charAt(0).toUpperCase() + person.last_name?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-2xl font-bold text-text-main-light dark:text-text-main-dark leading-tight" numberOfLines={2}>
              {person.first_name} {person.last_name}
            </Text>
            <View className="flex-row flex-wrap gap-2 mt-1">
              {person.is_regular_pioneer && (
                <View className={`px-2 py-0.5 rounded-full border ${getBadgeStyles("is_regular_pioneer")}`}>
                  <Text className={`text-xs font-medium ${getBadgeTextStyles("is_regular_pioneer")}`}>Precursor Regular</Text>
                </View>
              )}
              {person.is_elder && (
                <View className={`px-2 py-0.5 rounded-full border ${getBadgeStyles("is_elder")}`}>
                  <Text className={`text-xs font-medium ${getBadgeTextStyles("is_elder")}`}>Anciano</Text>
                </View>
              )}
              {person.is_ministerial_servant && (
                <View className={`px-2 py-0.5 rounded-full border ${getBadgeStyles("is_ministerial_servant")}`}>
                  <Text className={`text-xs font-medium ${getBadgeTextStyles("is_ministerial_servant")}`}>Siervo ministerial</Text>
                </View>
              )}
              {/* Fallback if no roles */}
              {!person.is_regular_pioneer && !person.is_elder && !person.is_ministerial_servant && (
                <View className="px-2 py-0.5 rounded-full border bg-surface-input-light dark:bg-surface-input-dark border-border-input-light dark:border-border-input-dark">
                  <Text className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">Publicador</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Year Selector */}
        <View className="bg-card-light dark:bg-card-dark rounded-xl p-3 shadow-sm border border-border-input-light dark:border-border-input-dark flex-row items-center justify-between mb-6">
          <Text className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wide ml-2">
            Año de Servicio
          </Text>
          <View className="flex-row items-center gap-3 bg-surface-input-light dark:bg-surface-input-dark rounded-lg p-1">
            <TouchableOpacity
              onPress={() => setSelectedYear(selectedYear - 1)}
              className="p-1 rounded-md bg-card-light dark:bg-card-dark shadow-sm"
            >
              <MaterialIcons name="chevron-left" size={20} color="#64748b" className="dark:text-slate-400" />
            </TouchableOpacity>
            <Text className="font-bold text-lg text-text-main-light dark:text-text-main-dark">{selectedYear}</Text>
            <TouchableOpacity
              onPress={() => setSelectedYear(selectedYear + 1)}
              disabled={selectedYear === currentYear}
              className={`p-1 rounded-md bg-card-light dark:bg-card-dark shadow-sm ${selectedYear === currentYear ? "opacity-50" : ""}`}
            >
              <MaterialIcons name="chevron-right" size={20} color="#2563eb" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Grid */}
        {person.is_regular_pioneer && (
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm border border-border-input-light dark:border-border-input-dark h-24 justify-between">
              <View className="flex-row justify-between items-start">
                <Text className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase">Total Horas</Text>
                <MaterialIcons name="schedule" size={20} color="#3b82f6" />
              </View>
              <Text className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">{totalHours}</Text>
            </View>
            <View className="flex-1 bg-card-light dark:bg-card-dark p-4 rounded-xl shadow-sm border border-border-input-light dark:border-border-input-dark h-24 justify-between">
              <View className="flex-row justify-between items-start">
                <Text className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase">Promedio</Text>
                <MaterialIcons name="trending-up" size={20} color="#22c55e" />
              </View>
              <Text className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">{averageHours}</Text>
            </View>
          </View>
        )}

        {/* Monthly Details */}
        <View className="gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold px-1 text-text-main-light dark:text-text-main-dark mb-1">Detalle Mensual</Text>
            <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              Sep {selectedYear - 1} - Ago {selectedYear}
            </Text>
          </View>

          {reports.map((report) => (
            <View
              key={report.id}
              className="bg-card-light dark:bg-card-dark rounded-xl overflow-hidden shadow-sm border border-border-input-light dark:border-border-input-dark"
            >
              {report.isFuture === true ? (
                <View className="flex-row items-center justify-between p-4 border-b border-border-input-light dark:border-border-input-dark bg-surface-input-light/50 dark:bg-surface-input-dark/20">
                  <View className="flex-row items-center gap-3">
                    <View className="w-10 h-10 rounded-full bg-surface-input-light dark:bg-surface-input-dark items-center justify-center">
                      <Text className="text-text-secondary-light/40 dark:text-text-secondary-dark/40 font-bold text-sm">
                        {shortMonthNames[report.month - 1]}
                      </Text>
                    </View>
                    <Text className="font-semibold text-lg text-text-secondary-light/40 dark:text-text-secondary-dark/40">
                      {monthNames[report.month - 1]}
                    </Text>
                  </View>
                  <View className="items-end">
                    <MaterialIcons name="lock-outline" size={24} color="#94a3b8" />
                  </View>
                </View>
              ) : report.isCurrent === true ? (
                <>
                  {/* Card Header */}
                  <View className="flex-row items-center justify-between p-4 border-b border-border-input-light dark:border-border-input-dark bg-surface-input-light/50 dark:bg-surface-input-dark/20">
                    <View className="flex-row items-center gap-3">
                      <View
                        className={`w-10 h-10 rounded-full ${report.participated ? "bg-blue-100 dark:bg-blue-900/30" : "bg-surface-input-light dark:bg-surface-input-dark"} items-center justify-center`}
                      >
                        <Text
                          className={`${report.participated ? "text-blue-600 dark:text-blue-400" : "text-text-secondary-light/40 dark:text-text-secondary-dark/40"} font-bold text-sm`}
                        >
                          {shortMonthNames[report.month - 1]}
                        </Text>
                      </View>
                      <Text className="font-semibold text-lg text-text-main-light dark:text-text-main-dark">
                        {monthNames[report.month - 1]}
                      </Text>
                      <View className="px-1.5 py-0.5 rounded-full border bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800">
                        <Text className="font-bold uppercase text-orange-600 dark:text-orange-400 text-[8px]">Pendiente</Text>
                      </View>
                    </View>
                  </View>

                  {/* Stats Row */}
                  <View className="p-4 items-center justify-center">
                    <Link href={`/people/${id}/reports/new`} asChild>
                      <TouchableOpacity className="flex-row items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full active:bg-blue-100 dark:active:bg-blue-900/40">
                        <MaterialIcons name="add-circle-outline" size={18} color="#2563eb" />
                        <Text className="text-sm font-semibold text-primary">Ingresar informe</Text>
                      </TouchableOpacity>
                    </Link>
                  </View>
                </>
              ) : (
                <>
                  {/* Card Header */}
                  <View className="flex-row items-center justify-between p-4 border-b border-border-input-light dark:border-border-input-dark bg-surface-input-light/50 dark:bg-surface-input-dark/20">
                    <View className="flex-row items-center gap-3">
                      <View
                        className={`w-10 h-10 rounded-full ${report.participated ? "bg-blue-100 dark:bg-blue-900/30" : "bg-surface-input-light dark:bg-surface-input-dark"} items-center justify-center`}
                      >
                        <Text
                          className={`${report.participated ? "text-blue-600 dark:text-blue-400" : "text-text-secondary-light/40 dark:text-text-secondary-dark/40"} font-bold text-sm`}
                        >
                          {shortMonthNames[report.month - 1]}
                        </Text>
                      </View>
                      <Text className="font-semibold text-lg text-text-main-light dark:text-text-main-dark">
                        {monthNames[report.month - 1]}
                      </Text>
                    </View>
                    {(report.is_auxiliary_pioneer || person.is_regular_pioneer) && (
                      <View className="items-end">
                        <Text className="text-2xl font-bold text-primary">{report.hours || 0}</Text>
                        <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark uppercase font-medium">Horas</Text>
                      </View>
                    )}
                  </View>

                  {/* Stats Row */}
                  <View className="p-4 flex-row divide-x divide-border-input-light dark:divide-border-input-dark">
                    <View className="flex-1 items-center gap-1">
                      <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Ministerio</Text>
                      <MaterialIcons
                        name={report.participated ? "check-circle" : "cancel"}
                        size={20}
                        color={report.participated ? "#22c55e" : "#ef4444"}
                      />
                    </View>
                    <View className="flex-1 items-center gap-1">
                      <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Cursos</Text>
                      <Text className="font-bold text-lg text-text-main-light dark:text-text-main-dark">{report.bible_courses || 0}</Text>
                    </View>
                    {!person.is_regular_pioneer && (
                      <View className="flex-1 items-center gap-1">
                        <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Auxiliar</Text>
                        <MaterialIcons
                          name="check-circle"
                          size={20}
                          color={report.is_auxiliary_pioneer ? "#3b82f6" : "#94a3b8"}
                          className="dark:text-slate-600"
                        />
                      </View>
                    )}
                  </View>

                  {/* Notes Footer */}
                  {report.notes ? (
                    <View className="px-4 py-3 bg-surface-input-light dark:bg-surface-input-dark border-t border-border-input-light dark:border-border-input-dark flex-row items-start gap-2">
                      <MaterialIcons
                        name="sticky-note-2"
                        size={16}
                        color="#64748b"
                        className="dark:text-slate-400"
                        style={{ marginTop: 2 }}
                      />
                      <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark flex-1">{report.notes}</Text>
                    </View>
                  ) : null}
                </>
              )}
            </View>
          ))}

          {reports.length === 0 && (
            <View className="p-8 items-center justify-center">
              <NoData icon="description" title="No hay reportes para este año" />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Edit FAB */}
      <View
        className="absolute right-6"
        style={{ bottom: Math.max(insets.bottom, 24) + 24 }} // Adjust position
      >
        <Link href={`/people/${id}/reports/new`} asChild>
          <TouchableOpacity className="bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg shadow-blue-500/40 active:scale-95 transition-transform">
            <MaterialIcons name="add" size={24} color="white" />
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}
