import { ShowAlert } from "@/components/alert";
import { useSession } from "@/components/ctx";
import { ThemedView } from "@/components/themed-view";
import { LogAction, logActionsService } from "@/services/log-actions.service";
import { reportService, ZipProgress } from "@/services/report.service";
import { ReportCongregationHome } from "@/types/report.types";
import { day, getInitialPeriod } from "@/utils/date.utils";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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

export default function HomeScreen() {
  const { month, year } = getInitialPeriod();
  const { user } = useSession();
  const [homeData, setHomeData] = useState<ReportCongregationHome | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<ZipProgress | null>(null);
  const [logs, setLogs] = useState<LogAction[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const { width } = useWindowDimensions();

  const isSmallScreen = width < 360;
  const isMediumScreen = width >= 640 && width < 1024;

  const fetchReportCongregationHome = useCallback(async () => {
    try {
      setIsLoading(true);
      if (!user?.congregation_id) return;
      const response = await reportService.getReportCongregationHome({
        congregation_id: user.congregation_id,
        year,
        month,
      });
      setHomeData(response);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.congregation_id]);

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoadingLogs(true);
      if (!user?.congregation_id) return;
      const response = await logActionsService.findAll({ limit: 5 });
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setIsLoadingLogs(false);
    }
  }, [user?.congregation_id]);

  const getMonthName = (month: number) => {
    return new Date(year, month - 1, 1).toLocaleString("es-ES", { month: "long" }).replace(/^\w/, (c) => c.toUpperCase());
  };

  const getMonthNameWithYear = (month: number) => {
    return new Date(year, month - 1, 1).toLocaleString("es-ES", { month: "long", year: "numeric" }).replace(/^\w/, (c) => c.toUpperCase());
  };

  const renderMessageGoal = () => {
    if (!homeData) return null;

    if (homeData.registered_reports === 0 && day >= 1 && day <= 20) {
      return <Text className="text-white text-sm font-medium">No has registrado ningun informe este mes. ¡No lo dejes para despues!</Text>;
    }

    if (homeData.registered_reports < homeData.expected_reports && day >= 21 && day <= 31) {
      return (
        <Text className="text-white text-sm font-medium">
          El mes de {getMonthName(month)} ha finalizado y no se han registrado todos los informes.
        </Text>
      );
    }

    if (homeData.registered_reports > 0 && homeData.registered_reports < homeData.expected_reports) {
      return (
        <Text className="text-white text-sm font-medium">
          Has registrado {homeData?.registered_reports} informes de {homeData?.expected_reports} del mes de {getMonthName(month)}. ¡Solo
          faltan {homeData?.expected_reports - homeData?.registered_reports} informes para tu meta!
        </Text>
      );
    }

    return (
      <Text className="text-white text-sm font-medium">¡Que bien! Todos los informes de {getMonthName(month)} han sido registrados</Text>
    );
  };

  const getPercentage = () => {
    if (!homeData) return 0;
    return (homeData.registered_reports / homeData.expected_reports) * 100;
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "ahora";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 172800) return "Ayer";
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  const getLogActionDescription = (log: LogAction) => {
    const actionMap: Record<string, string> = {
      CREATE: "Agregó",
      UPDATE: "Actualizó",
      DELETE: "Eliminó",
    };

    if (log.entity === "PublisherReport") {
      if (log.action === "CREATE") {
        const monthName = new Date(2000, (log.after?.month || 1) - 1).toLocaleString("es-ES", { month: "long" });
        return `Registró el informe de ${monthName} de ${log.person_name || "alguien"}`;
      }
      return `${actionMap[log.action] || "Modificó"} un informe`;
    }

    let entityName = "";
    if (log.entity === "Team") {
      entityName = `el grupo "${log.after?.name || log.before?.name || "Sin nombre"}"`;
    } else if (log.entity === "Person") {
      const p = log.after || log.before;
      entityName = `a ${p ? `${p.first_name} ${p.last_name}` : "una persona"}`;
    }

    return `${actionMap[log.action] || "Realizó una acción"} ${entityName}`;
  };

  const getLogIcon = (entity: string, action: string) => {
    if (entity === "PublisherReport") return "post-add";
    if (entity === "Team") return "groups";
    if (entity === "Person") return action === "CREATE" ? "person-add" : "person";
    return "history";
  };

  const handleDownloadReport = async () => {
    if (!user?.congregation_id) return;
    setIsDownloading(true);
    setDownloadProgress(null);

    try {
      const serviceYear = month >= 9 ? year + 1 : year;
      await reportService.downloadCongregationPublishersServiceYearZip({
        congregation_id: user.congregation_id,
        service_year: serviceYear,
        onProgress: (progress) => {
          setDownloadProgress(progress);
        },
      });
    } catch (error) {
      console.error("Error downloading report:", error);
      ShowAlert("Error", "No se pudo descargar el archivo.");
    } finally {
      setIsDownloading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReportCongregationHome();
      fetchLogs();
    }, [fetchReportCongregationHome, fetchLogs]),
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView edges={["top"]} style={{ backgroundColor: "transparent" }}>
        {/* Sticky Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border-input-light dark:border-border-input-dark bg-background-light dark:bg-background-dark">
          <View className="flex-row items-center gap-3">
            <Text className="text-xl font-bold tracking-tight text-text-main-light dark:text-text-main-dark">Inicio</Text>
          </View>
          <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full">
            <MaterialIcon name="notifications-none" size={24} color="#64748b" className="dark:text-slate-400" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 10 }} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View className="flex-row items-center gap-4 px-4 pt-4 pb-6">
          <View className="h-16 w-16 rounded-full border-2 border-border-input-light dark:border-border-input-dark items-center justify-center">
            <MaterialIcon name="person" size={40} color="#64748b" className="dark:text-slate-400" />
          </View>
          <View>
            <Text className="text-2xl font-bold tracking-tight text-text-main-light dark:text-text-main-dark">
              Hola, {user?.first_name}
            </Text>
            <Text className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
              {`${new Date().getDate()} de ${new Date().toLocaleString("es-ES", { month: "long" }).replace(/^\w/, (c) => c.toUpperCase())}, ${new Date().getFullYear()}`}
            </Text>
          </View>
        </View>

        {/* Monthly Summary Card */}
        <View className="px-4 pb-6">
          <View className="overflow-hidden rounded-xl bg-sky-500 p-6 shadow-xl relative border border-sky-400/20">
            {/* Background decorative circles like in HTML */}
            <View
              className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full"
              style={{ transform: [{ scale: 1.5 }] }}
            />
            <View
              className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 bg-sky-300/20 rounded-full"
              style={{ transform: [{ scale: 1.2 }] }}
            />

            <View className="z-10">
              <View className="flex-row justify-between items-start mb-2">
                <View>
                  <Text className="text-white text-[10px] font-bold uppercase tracking-widest">
                    Resumen del mes de {getMonthNameWithYear(month)}
                  </Text>
                  <View className="flex-row items-baseline mt-1">
                    <Text className="text-white text-4xl font-bold">
                      {homeData?.registered_reports} de {homeData?.expected_reports}{" "}
                    </Text>
                    <Text className="text-sky-100 ml-1 text-lg font-medium">informes</Text>
                  </View>
                </View>
                <View className="bg-white/20 px-3 py-1.5 rounded-full flex-row items-center gap-1 border border-white/20">
                  {/* TODO: hacer que el porcentaje sea dinamico */}
                  <MaterialIcon name="trending-up" size={14} color="white" />
                  <Text className="text-white text-xs font-bold">+12%</Text>
                </View>
              </View>

              <View className="gap-4 mt-2">
                {renderMessageGoal()}

                <View className="gap-2">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-[10px] text-sky-100 font-bold uppercase">Progreso</Text>
                    <Text className="text-xs text-white font-bold">{getPercentage().toFixed(0)}%</Text>
                  </View>
                  <View className="h-2.5 w-full bg-black/20 rounded-full overflow-hidden border border-white/10">
                    <View className="h-full bg-white rounded-full" style={{ width: `${getPercentage()}%` }} />
                  </View>
                </View>

                {isDownloading && downloadProgress ? (
                  <View className="h-16 w-full flex-col items-center justify-center gap-2 bg-white/95 rounded-xl border border-sky-100">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-sky-600 text-xs font-medium">{downloadProgress.currentFile}</Text>
                      <Text className="text-sky-600 text-xs font-bold">{downloadProgress.percent}%</Text>
                    </View>
                    <View className="h-2 w-[90%] bg-sky-200 rounded-full overflow-hidden">
                      <View className="h-full bg-sky-500 rounded-full" style={{ width: `${downloadProgress.percent}%` }} />
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleDownloadReport}
                    disabled={isDownloading}
                    className="h-12 w-full flex-row items-center justify-center gap-2 bg-white rounded-xl shadow-lg"
                  >
                    <Text className="text-sky-600 text-sm font-bold">Descargar registro de publicadores</Text>
                    {isDownloading && <ActivityIndicator size="small" />}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View className="px-4 pb-2">
          <Text className="text-lg font-bold mb-4 text-text-main-light dark:text-text-main-dark">Acciones rápidas</Text>
          <View className="flex-row gap-4">
            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-1 items-center justify-center gap-3 p-4 rounded-xl bg-card-light dark:bg-card-dark border border-border-input-light dark:border-border-input-dark"
              onPress={() => router.push("/people/0/reports/new")}
            >
              <View className="bg-primary/10 p-3 rounded-full">
                <MaterialIcon name="post-add" size={24} color="#2563eb" />
              </View>
              <Text className="text-sm font-medium text-text-main-light dark:text-text-main-dark">Registrar informe</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-1 items-center justify-center gap-3 p-4 rounded-xl bg-card-light dark:bg-card-dark border border-border-input-light dark:border-border-input-dark"
              onPress={() => router.push("/people/new")}
            >
              <View className="bg-indigo-50 dark:bg-indigo-500/10 p-3 rounded-full">
                <MaterialIcon name="person-add" size={24} color="#4f46e5" />
              </View>
              <Text className="text-sm font-medium text-text-main-light dark:text-text-main-dark">Nueva persona</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Section */}
        <View className={`flex-row flex-wrap gap-2 px-4 py-3 ${isSmallScreen ? "flex-col" : "flex-row"}`}>
          <View
            style={styles.floatingCard}
            className={`${isSmallScreen ? "w-full" : "flex-1"} rounded-xl p-3 bg-card-light dark:bg-card-dark border border-border-input-light dark:border-border-input-dark`}
          >
            <View className="flex-row items-center justify-between">
              <View className="p-2 bg-purple-100 dark:bg-purple-500/10 rounded-lg">
                <MaterialIcon name="groups" size={20} color="#a855f7" />
              </View>
              <View className="items-end">
                <Text className="text-lg font-bold text-text-main-light dark:text-text-main-dark">{homeData?.total_teams || 0}</Text>
                <Text className="text-text-secondary-light dark:text-text-secondary-dark text-[10px] font-medium">Grupos</Text>
              </View>
            </View>
          </View>
          <View
            style={styles.floatingCard}
            className={`${isSmallScreen ? "w-full" : "flex-1"} rounded-xl p-3 bg-card-light dark:bg-card-dark border border-border-input-light dark:border-border-input-dark`}
          >
            <View className="flex-row items-center justify-between">
              <View className="p-2 bg-orange-100 dark:bg-orange-500/10 rounded-lg">
                <MaterialIcon name="diversity-3" size={20} color="#f97316" />
              </View>
              <View className="items-end">
                <Text className="text-lg font-bold text-text-main-light dark:text-text-main-dark">{homeData?.total_people || 0}</Text>
                <Text className="text-text-secondary-light dark:text-text-secondary-dark text-[10px] font-medium">Personas</Text>
              </View>
            </View>
          </View>
          <View
            style={styles.floatingCard}
            className={`${isSmallScreen ? "w-full" : "flex-1"} rounded-xl p-3 bg-card-light dark:bg-card-dark border border-border-input-light dark:border-border-input-dark`}
          >
            <View className="flex-row items-center justify-between">
              <View className="p-2 bg-green-100 dark:bg-green-500/10 rounded-lg">
                <MaterialIcon name="checklist" size={20} color="#10b981" />
              </View>
              <View className="items-end">
                <Text className="text-lg font-bold text-text-main-light dark:text-text-main-dark">
                  {homeData?.total_active_people || 0}
                </Text>
                <Text className="text-text-secondary-light dark:text-text-secondary-dark text-[10px] font-medium">Activos</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Predication Summary Section */}
        <View className="px-4 pt-2">
          <Text className="text-lg font-bold mb-3 text-text-main-light dark:text-text-main-dark">Resumen de predicación</Text>
          <View className={`flex-row flex-wrap gap-2 pb-3 ${isSmallScreen ? "flex-col" : "flex-row"}`}>
            {/* Publicadores */}
            <View
              style={styles.floatingCard}
              className={`${isSmallScreen ? "w-full" : "flex-1"} rounded-xl p-3 bg-card-light dark:bg-card-dark border border-border-input-light dark:border-border-input-dark`}
            >
              <View className="flex-row items-center gap-1.5 mb-2">
                <MaterialIcon name="description" size={16} color="#3b82f6" />
                <Text className="text-xs font-bold text-text-main-light dark:text-text-main-dark" numberOfLines={1}>
                  Publicadores
                </Text>
              </View>
              <View className="gap-1">
                <View className="flex-row justify-between items-center">
                  <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs">Informes</Text>
                  <Text className="text-xs font-bold text-text-main-light dark:text-text-main-dark">
                    {homeData?.summary?.publishers?.reports || 0}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs">Cursos bíblicos</Text>
                  <Text className="text-xs font-bold text-text-main-light dark:text-text-main-dark">
                    {homeData?.summary?.publishers?.bible_courses || 0}
                  </Text>
                </View>
              </View>
            </View>

            {/* Auxiliares */}
            <View
              style={styles.floatingCard}
              className={`${isSmallScreen ? "w-full" : "flex-1"} rounded-xl p-3 bg-card-light dark:bg-card-dark border border-border-input-light dark:border-border-input-dark`}
            >
              <View className="flex-row items-center gap-1.5 mb-2">
                <MaterialIcon name="access-time" size={16} color="#f59e0b" />
                <Text className="text-xs font-bold text-text-main-light dark:text-text-main-dark" numberOfLines={1}>
                  Auxiliares
                </Text>
              </View>
              <View className="gap-1">
                <View className="flex-row justify-between items-center">
                  <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs">Informes</Text>
                  <Text className="text-xs font-bold text-text-main-light dark:text-text-main-dark">
                    {homeData?.summary?.auxiliary_pioneers?.reports || 0}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs">Horas</Text>
                  <Text className="text-xs font-bold text-text-main-light dark:text-text-main-dark">
                    {homeData?.summary?.auxiliary_pioneers?.hours || 0}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs">Cursos bíblicos</Text>
                  <Text className="text-xs font-bold text-text-main-light dark:text-text-main-dark">
                    {homeData?.summary?.auxiliary_pioneers?.bible_courses || 0}
                  </Text>
                </View>
              </View>
            </View>

            {/* Regulares */}
            <View
              style={styles.floatingCard}
              className={`${isSmallScreen ? "w-full" : "flex-1"} rounded-xl p-3 bg-card-light dark:bg-card-dark border border-border-input-light dark:border-border-input-dark`}
            >
              <View className="flex-row items-center gap-1.5 mb-2">
                <MaterialIcon name="verified" size={16} color="#14b8a6" />
                <Text className="text-xs font-bold text-text-main-light dark:text-text-main-dark" numberOfLines={1}>
                  Regulares
                </Text>
              </View>
              <View className="gap-1">
                <View className="flex-row justify-between items-center">
                  <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs">Informes</Text>
                  <Text className="text-xs font-bold text-text-main-light dark:text-text-main-dark">
                    {homeData?.summary?.regular_pioneers?.reports || 0}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs">Horas</Text>
                  <Text className="text-xs font-bold text-text-main-light dark:text-text-main-dark">
                    {homeData?.summary?.regular_pioneers?.hours || 0}
                  </Text>
                </View>
                <View className="flex-row justify-between items-center">
                  <Text className="text-text-secondary-light dark:text-text-secondary-dark text-xs">Cursos bíblicos</Text>
                  <Text className="text-xs font-bold text-text-main-light dark:text-text-main-dark">
                    {homeData?.summary?.regular_pioneers?.bible_courses || 0}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View className="gap-4 px-4 pt-2 pb-6">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-bold text-text-main-light dark:text-text-main-dark">Actividad Reciente</Text>
            <TouchableOpacity>
              <Text className="text-primary text-sm font-medium">Ver todo</Text>
            </TouchableOpacity>
          </View>

          <View className="gap-3">
            {isLoadingLogs ? (
              <ActivityIndicator size="small" color="#2563eb" />
            ) : logs.length === 0 ? (
              <Text className="text-text-secondary text-sm text-center py-4">No hay actividad reciente</Text>
            ) : (
              logs.map((log) => (
                <View
                  key={log.id}
                  style={styles.floatingCard}
                  className="flex-row items-center gap-4 bg-card-light dark:bg-card-dark p-4 rounded-xl border border-border-input-light dark:border-border-input-dark"
                >
                  <View className="p-2 bg-sky-50 dark:bg-sky-500/10 rounded-lg">
                    <MaterialIcon name={getLogIcon(log.entity, log.action)} size={20} color="#0284c7" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {log.user.first_name} {log.user.last_name}
                    </Text>
                    <Text className="text-slate-500 dark:text-slate-400 text-xs mt-0.5" numberOfLines={2}>
                      {getLogActionDescription(log)}
                    </Text>
                  </View>
                  <Text className="text-slate-400 text-[10px] font-medium">{getTimeAgo(log.createdAt)}</Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
