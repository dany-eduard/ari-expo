import { ShowAlert } from "@/components/alert";
import { useSession } from "@/components/ctx";
import { APP_VERSION } from "@/constants/config";
import { reportService } from "@/services/report.service";
import { currentYear, getInitialPeriod } from "@/utils/date.utils";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  iosShadow: {
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
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

const MaterialIcon = ({ name, size = 24, color }: { name: string; size?: number; color?: string }) => {
  return <MaterialIcons name={name as any} size={size} color={color} />;
};

export default function SettingsScreen() {
  const { month, year } = getInitialPeriod();
  const { user, signOut } = useSession();
  const insets = useSafeAreaInsets();

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadReport = async () => {
    if (!user?.congregation_id) return;
    setIsDownloading(true);

    try {
      // Service Year: September (8) starts the next service year
      const serviceYear = month >= 9 ? year + 1 : year;
      await reportService.downloadCongregationPublishersServiceYearZip({
        congregation_id: user.congregation_id,
        service_year: serviceYear,
      });
    } catch (error) {
      console.error("Error downloading report:", error);
      ShowAlert("Error", "No se pudo descargar el archivo.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <View className="flex-1 bg-background-page" style={{ paddingTop: insets.top + 14 }}>
      {/* Sticky Responsive Header */}
      <View className="z-50 bg-white/90 border-b border-slate-200" style={Platform.OS === "web" ? { position: "sticky", top: 0 } : {}}>
        <View className="gap-3 max-w-7xl mx-auto w-full px-4 md:px-6">
          <View className="flex-row items-center md:pt-6 pb-2 justify-between">
            <View>
              <Text className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Ajustes</Text>
            </View>

            <View className="flex-row items-center gap-3">
              <TouchableOpacity className="w-11 h-11 items-center justify-center rounded-full hover:bg-slate-100" onPress={signOut}>
                <MaterialIcon name="logout" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, padding: 24, paddingBottom: 40 }}>
        <View className="max-w-md mx-auto w-full flex-1 gap-8">
          {/* Section: Reportes y Análisis */}
          <View className="space-y-4">
            <Text className="px-1 text-xs font-bold text-slate-400 uppercase tracking-[0.1em]">Reportes y Análisis</Text>
            <View
              style={styles.iosShadow}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleDownloadReport}
                disabled={isDownloading}
                className="w-full flex-row items-center justify-between p-5 border-b border-slate-50 dark:border-slate-800 active:bg-slate-50 dark:active:bg-slate-800/50"
              >
                <View className="flex-row items-center justify-center gap-4 flex-1 pr-2">
                  <View className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 items-center justify-center">
                    <MaterialIcon name="download" size={22} color="#2563eb" />
                  </View>
                  <Text className="font-semibold text-[16px] text-slate-700 dark:text-slate-200 flex-1">
                    Descargar tarjetas de publicadores ({currentYear}){" "}
                  </Text>
                  {isDownloading && <ActivityIndicator size="small" />}
                </View>
                <MaterialIcon name="chevron-right" size={20} color="#cbd5e1" />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => ShowAlert("Info", "Funcionalidad en desarrollo, pronto estará disponible.")}
                className="w-full flex-row items-center justify-between p-5 border-b border-slate-50 dark:border-slate-800 active:bg-slate-50 dark:active:bg-slate-800/50"
              >
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 items-center justify-center">
                    <MaterialIcon name="bar-chart" size={22} color="#2563eb" />
                  </View>
                  <Text className="font-semibold text-[16px] text-slate-700 dark:text-slate-200">Análisis por año de servicio</Text>
                </View>
                <MaterialIcon name="chevron-right" size={20} color="#cbd5e1" />
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => ShowAlert("Info", "Funcionalidad en desarrollo, pronto estará disponible.")}
                className="w-full flex-row items-center justify-between p-5 active:bg-slate-50 dark:active:bg-slate-800/50"
              >
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 items-center justify-center">
                    <MaterialIcon name="description" size={22} color="#2563eb" />
                  </View>
                  <Text className="font-semibold text-[16px] text-slate-700 dark:text-slate-200">Resumen mensual</Text>
                </View>
                <MaterialIcon name="chevron-right" size={20} color="#cbd5e1" />
              </TouchableOpacity>
            </View>
          </View>
          {/* Section: Configuración */}
          <View className="space-y-4">
            <Text className="px-1 text-xs font-bold text-slate-400 uppercase tracking-[0.1em]">Configuración de app</Text>
            <View
              style={styles.iosShadow}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
            >
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => ShowAlert("Info", "Funcionalidad en desarrollo, pronto estará disponible.")}
                className="w-full flex-row items-center justify-between p-5 border-b border-slate-50 dark:border-slate-800 active:bg-slate-50 dark:active:bg-slate-800/50"
              >
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 items-center justify-center">
                    <MaterialIcon name="group-work" size={22} color="#2563eb" />
                  </View>
                  <Text className="font-semibold text-[16px] text-slate-700 dark:text-slate-200">Administrar congregaciones</Text>
                </View>
                <MaterialIcon name="chevron-right" size={20} color="#cbd5e1" />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => router.push("/auth/sign-up")}
                className="w-full flex-row items-center justify-between p-5 border-b border-slate-50 dark:border-slate-800 active:bg-slate-50 dark:active:bg-slate-800/50"
              >
                <View className="flex-row items-center gap-4">
                  <View className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 items-center justify-center">
                    <MaterialIcon name="person-add" size={22} color="#2563eb" />
                  </View>
                  <Text className="font-semibold text-[16px] text-slate-700 dark:text-slate-200">Registrar usuario</Text>
                </View>
                <MaterialIcon name="chevron-right" size={20} color="#cbd5e1" />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mt-auto gap-8">
            {/* Section: Logout */}
            <View className="pt-4">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={signOut}
                style={styles.iosShadow}
                className="w-full flex-row items-center justify-center gap-2 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-red-50 dark:border-red-950/20 active:scale-[0.98]"
              >
                <MaterialIcon name="logout" size={20} color="#ef4444" />
                <Text className="text-red-500 font-bold">Cerrar sesión</Text>
              </TouchableOpacity>
            </View>

            {/* Version Info */}
            <View className="items-center py-1">
              <Text className="text-slate-400 dark:text-slate-500 text-xs font-medium">ARI v{APP_VERSION}</Text>
              <Text className="text-slate-300 dark:text-slate-600 text-[10px] mt-1 uppercase tracking-widest">
                © {currentYear} ARI Mobile App
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
