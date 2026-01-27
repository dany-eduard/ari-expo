import { ShowAlert } from "@/components/alert";
import { useSession } from "@/components/ctx";
import { Loading } from "@/components/ui/loading";
import { personService } from "@/services/person.service";
import { publisherReportService } from "@/services/publisher-report.service";
import { Person } from "@/types/person.types";
import { PublisherReport } from "@/types/publisher-report.types";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SelectionModal = ({
  visible,
  onClose,
  options,
  onSelect,
  title,
  currentValue,
}: {
  visible: boolean;
  onClose: () => void;
  options: { label: string; value: string }[];
  onSelect: (value: string) => void;
  title: string;
  currentValue: string;
}) => (
  <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
    <View className="flex-1 bg-black/40 justify-end">
      <Pressable className="flex-1" onPress={onClose} />
      <View className="bg-background-light dark:bg-background-dark rounded-t-3xl overflow-hidden pb-8 max-h-[70%]">
        <View className="p-5 border-b border-border-input-light dark:border-border-input-dark flex-row items-center justify-between">
          <Text className="text-text-main-light dark:text-text-main-dark text-lg font-bold">{title}</Text>
          <TouchableOpacity onPress={onClose} className="p-1">
            <MaterialIcons name="close" size={24} color="#64748b" className="dark:text-slate-400" />
          </TouchableOpacity>
        </View>
        <FlatList
          data={options}
          keyExtractor={(item) => item.value}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                onSelect(item.value);
                onClose();
              }}
              className={`p-5 flex-row items-center justify-between ${item.value === currentValue ? "bg-primary/5 dark:bg-primary/10" : ""}`}
            >
              <Text
                className={`text-base ${item.value === currentValue ? "text-primary font-bold" : "text-text-main-light dark:text-text-main-dark"}`}
              >
                {item.label}
              </Text>
              {item.value === currentValue && <MaterialIcons name="check-circle" size={24} color="#2563eb" />}
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  </Modal>
);

const months = [
  { label: "Enero", value: "01" },
  { label: "Febrero", value: "02" },
  { label: "Marzo", value: "03" },
  { label: "Abril", value: "04" },
  { label: "Mayo", value: "05" },
  { label: "Junio", value: "06" },
  { label: "Julio", value: "07" },
  { label: "Agosto", value: "08" },
  { label: "Septiembre", value: "09" },
  { label: "Octubre", value: "10" },
  { label: "Noviembre", value: "11" },
  { label: "Diciembre", value: "12" },
];

const getYearOptions = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed (0 = January)
  const years = [currentYear];

  if (currentMonth <= 2) {
    // January, February, March
    years.push(currentYear - 1);
  } else if (currentMonth >= 10) {
    // November, December
    years.push(currentYear + 1);
  }

  return years
    .sort((a, b) => a - b)
    .map((year) => ({
      label: year.toString(),
      value: year.toString(),
    }));
};

const getInitialPeriod = () => {
  const day = now.getDate();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  if (day >= 1 && day <= 20) {
    if (currentMonth === 1) {
      return { month: 12, year: currentYear - 1 };
    }
    return { month: currentMonth - 1, year: currentYear };
  }
  return { month: currentMonth, year: currentYear };
};

const formatDateReport = (month: number, year: number) => {
  const d = new Date(year, month - 1, 1);
  const formatted = d.toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const formatDateCreatedAt = (date: string) => {
  const d = new Date(date);
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const years = getYearOptions();
const now = new Date();

export default function NewReportScreen() {
  const { user } = useSession();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();

  const [modalType, setModalType] = useState<"publisher" | "month" | "year" | null>(null);
  const [publishers, setPublishers] = useState<{ label: string; value: string }[]>([]);
  const [reports, setReports] = useState<PublisherReport[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [isRegularPioneer, setIsRegularPioneer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  const { month, year } = getInitialPeriod();

  const [formData, setFormData] = useState({
    publisherId: id!,
    month: month.toString().padStart(2, "0"),
    year: year.toString(),
    isAuxiliaryPioneer: false,
    participated: false,
    hours: "",
    bibleStudies: "",
    remarks: "",
  });

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const fetchPeople = useCallback(async () => {
    if (!user?.congregation_id) return;
    setIsLoading(true);
    try {
      const people = await personService.getPersonsByCongregationId(user.congregation_id);
      people.sort((a: Person, b: Person) => a.last_name.localeCompare(b.last_name));
      const publishers = people.map((person: Person) => ({
        label: person.first_name.trim() + " " + person.last_name.trim(),
        value: person.id,
      }));
      setPublishers(publishers);
      setPeople(people);
    } catch (error) {
      console.error("Error fetching people:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.congregation_id]);

  const fetchPublisherReports = useCallback(async () => {
    if (!user?.congregation_id || !id || Number(id) === 0) return;
    setIsLoadingReports(true);
    try {
      const reports = await publisherReportService.getPublisherReportsByPersonId({ person_id: id!, limit: 3, order: "desc" });
      setReports(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setIsLoadingReports(false);
    }
  }, [user?.congregation_id, id]);

  const handleCreate = async () => {
    try {
      setIsLoading(true);
      await publisherReportService.createPublisherReport({
        person_id: +formData.publisherId,
        year: +formData.year,
        month: +formData.month,
        participated: formData.participated || Boolean(formData.hours),
        hours: +formData.hours,
        bible_courses: +formData.bibleStudies,
        notes: formData.remarks,
        is_auxiliary_pioneer: formData.isAuxiliaryPioneer,
      });
      ShowAlert("Éxito", "Reporte creado exitosamente");
      router.back();
    } catch (error: any) {
      console.error("Error creating report:", error);
      ShowAlert("Error", error?.message || "No se pudo crear el reporte");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPeople();
  }, [fetchPeople]);

  useEffect(() => {
    fetchPublisherReports();
  }, [fetchPublisherReports]);

  const currentPublisher: Person | undefined = React.useMemo(() => {
    const publisher = people.find((p) => +p.id === +formData.publisherId);
    if (publisher?.is_regular_pioneer) setIsRegularPioneer(true);
    else setIsRegularPioneer(false);
    return publisher;
  }, [people, formData.publisherId, id]);

  const currentMonth = months.find((m) => m.value === formData.month)?.label;

  if (isLoading) return <Loading />;

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Selection Modals */}
      <SelectionModal
        visible={modalType === "publisher"}
        onClose={() => setModalType(null)}
        options={publishers}
        title="Publicador"
        currentValue={formData.publisherId}
        onSelect={(val) => {
          handleChange("publisherId", val);
          router.setParams({ id: val });
        }}
      />
      <SelectionModal
        visible={modalType === "month"}
        onClose={() => setModalType(null)}
        options={months}
        title="Mes"
        currentValue={formData.month}
        onSelect={(val) => handleChange("month", val)}
      />
      <SelectionModal
        visible={modalType === "year"}
        onClose={() => setModalType(null)}
        options={years}
        title="Año"
        currentValue={formData.year}
        onSelect={(val) => handleChange("year", val)}
      />

      {/* Header */}
      <View
        className="bg-background-light/95 dark:bg-card-dark/95 border-b border-border-input-light dark:border-border-input-dark z-50"
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center justify-between px-4 h-[60px] relative">
          <TouchableOpacity onPress={() => router.back()} className="flex items-center active:opacity-60 z-10">
            <Text className="text-primary text-[17px] font-normal">Cancelar</Text>
          </TouchableOpacity>
          <View className="absolute top-0 left-0 right-0 bottom-0 items-center justify-center" pointerEvents="none">
            <Text
              className="text-[17px] font-semibold text-center text-text-main-light dark:text-text-main-dark w-full max-w-[200px]"
              numberOfLines={1}
            >
              Informe Mensual
            </Text>
          </View>
          <View className="w-[70px]" />
        </View>
      </View>

      <KeyboardAvoidingView behavior="position" className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          <View className="flex-col gap-6">
            {/* Periodo y Publicador */}
            <View className="flex-col gap-2">
              <Text className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider ml-1">
                Periodo y Publicador
              </Text>

              <View className="flex-col bg-card-light dark:bg-card-dark rounded-xl overflow-hidden shadow-sm border border-border-input-light dark:border-border-input-dark divide-y divide-border-input-light dark:divide-border-input-dark">
                {/* Publisher */}
                <TouchableOpacity
                  onPress={() => setModalType("publisher")}
                  activeOpacity={0.7}
                  className="relative flex-row items-center p-4 hover:bg-gray-50"
                >
                  <MaterialIcons name="person" size={24} color="#9ca3af" style={{ marginRight: 12 }} />
                  <View className="flex-1">
                    <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark block mb-0.5">Publicador</Text>
                    {currentPublisher?.first_name ? (
                      <Text className="text-base font-medium text-text-main-light dark:text-text-main-dark">
                        {currentPublisher?.first_name?.trim() + " " + currentPublisher?.last_name?.trim()}
                      </Text>
                    ) : (
                      <Text className="text-base font-medium text-text-secondary-light/60 dark:text-text-secondary-dark/60">
                        Selecciona a un publicador
                      </Text>
                    )}
                  </View>
                  <MaterialIcons name="expand-more" size={24} color="#9ca3af" />
                </TouchableOpacity>

                {/* Period Row */}
                <View className="flex-row divide-x divide-gray-100">
                  <TouchableOpacity
                    onPress={() => setModalType("month")}
                    activeOpacity={0.7}
                    className="relative flex-1 flex-row items-center p-4"
                  >
                    <MaterialIcons name="calendar-today" size={24} color="#9ca3af" style={{ marginRight: 12 }} />
                    <View className="flex-1">
                      <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark block mb-0.5">Mes</Text>
                      <Text className="text-base font-medium text-text-main-light dark:text-text-main-dark">{currentMonth}</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => setModalType("year")}
                    activeOpacity={0.7}
                    className="relative w-1/3 flex-row items-center p-4"
                  >
                    <View className="flex-1">
                      <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark block mb-0.5">Año</Text>
                      <Text className="text-base font-medium text-text-main-light dark:text-text-main-dark">{formData.year}</Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* Aux Pioneer or Regular Pioneer */}
                <TouchableOpacity
                  onPress={() => handleChange("isAuxiliaryPioneer", !formData.isAuxiliaryPioneer)}
                  activeOpacity={0.7}
                  disabled={isRegularPioneer}
                  className="relative flex-row items-center justify-between p-4"
                >
                  <View className="flex-row items-center">
                    <MaterialIcons
                      name="workspace-premium"
                      size={24}
                      color={`${isRegularPioneer ? (currentPublisher?.sex === "MALE" ? "#2563eb" : "#f472b6") : "#9ca3af"}`}
                      style={{ marginRight: 12 }}
                    />
                    <View className="flex-col">
                      <Text className="text-sm font-medium text-text-main-light dark:text-text-main-dark">
                        {isRegularPioneer ? "Precursor Regular" : "Precursor Auxiliar"}
                      </Text>
                      {!isRegularPioneer && (
                        <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Marcar si aplica este mes</Text>
                      )}
                    </View>
                  </View>
                  {!isRegularPioneer && (
                    <View
                      className={`w-5 h-5 rounded border items-center justify-center ${formData.isAuxiliaryPioneer ? "bg-primary border-primary" : "border-border-input-light dark:border-border-input-dark"}`}
                    >
                      {formData.isAuxiliaryPioneer && <MaterialIcons name="check" size={16} color="white" />}
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Actividad del Mes */}
            <View className="flex-col gap-2">
              <Text className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider ml-1">
                Actividad del Mes
              </Text>

              <View className="bg-card-light dark:bg-card-dark rounded-2xl border border-border-input-light dark:border-border-input-dark shadow-sm overflow-hidden divide-y divide-border-input-light dark:divide-border-input-dark">
                {/* Participation / Hours */}
                {isRegularPioneer || formData.isAuxiliaryPioneer ? (
                  <View className="flex-row items-center justify-between p-5">
                    <View className="flex-row items-center gap-4">
                      <View className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <MaterialIcons name="schedule" size={28} color="#2563eb" />
                      </View>
                      <View>
                        <Text className="text-base font-semibold text-text-main-light dark:text-text-main-dark block">
                          Horas en el ministerio
                        </Text>
                        <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Horas predicadas este mes</Text>
                      </View>
                    </View>
                    <View className="bg-surface-input-light dark:bg-surface-input-dark rounded-lg px-2 w-20">
                      <TextInput
                        className="text-right font-bold text-lg text-text-main-light dark:text-text-main-dark p-2"
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#9ca3af80"
                        value={formData.hours?.toString()}
                        onChangeText={(val) => handleChange("hours", val)}
                      />
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleChange("participated", !formData.participated)}
                    className="flex-row items-center justify-between p-5 active:bg-gray-50"
                  >
                    <View className="flex-row items-center gap-4">
                      <View className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <MaterialIcons name="volunteer-activism" size={28} color="#2563eb" />
                      </View>
                      <View>
                        <Text className="text-base font-semibold text-text-main-light dark:text-text-main-dark block">
                          Participó en el ministerio
                        </Text>
                        <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark">¿Predicó durante este mes?</Text>
                      </View>
                    </View>
                    <Switch
                      trackColor={{ false: colorScheme === "dark" ? "#334155" : "#e2e8f0", true: "#2563eb" }}
                      thumbColor="#ffffff"
                      ios_backgroundColor={colorScheme === "dark" ? "#334155" : "#e2e8f0"}
                      onValueChange={(val) => handleChange("participated", val)}
                      value={formData.participated}
                    />
                  </TouchableOpacity>
                )}

                {/* Bible Studies */}
                <View className="flex-row items-center justify-between p-5">
                  <View className="flex-row items-center gap-4">
                    <View className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <MaterialIcons name="menu-book" size={28} color="#2563eb" />
                    </View>
                    <View>
                      <Text className="text-base font-semibold text-text-main-light dark:text-text-main-dark block">Cursos bíblicos</Text>
                      <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Número de cursos de la Biblia</Text>
                    </View>
                  </View>
                  <View className="bg-surface-input-light dark:bg-surface-input-dark rounded-lg px-2 w-20">
                    <TextInput
                      className="text-right font-bold text-lg text-text-main-light dark:text-text-main-dark p-2"
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#9ca3af80"
                      value={formData.bibleStudies}
                      onChangeText={(val) => handleChange("bibleStudies", val)}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* Observaciones */}
            <View className="flex-col gap-2">
              <Text className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider ml-1">
                Observaciones (Opcional)
              </Text>
              <View className="bg-card-light dark:bg-card-dark rounded-xl border border-border-input-light dark:border-border-input-dark shadow-sm overflow-hidden p-2">
                <TextInput
                  className="w-full h-24 text-base text-text-main-light dark:text-text-main-dark p-2"
                  multiline
                  placeholder="Participación en construcción, número de horas aprobadas del salón de asamblea, estuvo enfermo, etc..."
                  placeholderTextColor="#9ca3af"
                  textAlignVertical="top"
                  value={formData.remarks}
                  onChangeText={(val) => handleChange("remarks", val)}
                  style={{ textAlignVertical: "top" }}
                />
              </View>
            </View>

            {/* Historial */}
            <View className="pt-2">
              <View className="flex-row items-center justify-between mb-3 px-1">
                <Text className="text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark uppercase tracking-wider">
                  Historial de Meses Anteriores
                </Text>
                <TouchableOpacity onPress={() => router.push(`/people/${id}/reports/record`)}>
                  <Text className="text-xs font-semibold text-primary">Ver Todo</Text>
                </TouchableOpacity>
              </View>

              {isLoadingReports ? (
                <ActivityIndicator size="large" color="#2563eb" />
              ) : reports.length > 0 ? (
                <View className="gap-3">
                  {reports.map((report) => (
                    <View
                      key={report.id}
                      className="flex-row items-center justify-between p-3 bg-card-light dark:bg-card-dark rounded-xl border border-border-input-light dark:border-border-input-dark opacity-70"
                    >
                      <View className="flex-row items-center gap-3">
                        <View
                          className={`w-10 h-10 rounded-full ${report.participated ? "bg-green-100" : "bg-orange-100"} flex items-center justify-center`}
                        >
                          <MaterialIcons
                            name={report.participated ? "check" : "warning"}
                            size={20}
                            color={report.participated ? "#16a34a" : "#ef4444"}
                          />
                        </View>
                        <View>
                          <Text className="text-sm font-semibold text-text-main-light dark:text-text-main-dark">
                            {formatDateReport(report.month, report.year!)}
                          </Text>
                          <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                            Enviado el {formatDateCreatedAt(report.createdAt!)}
                          </Text>
                        </View>
                      </View>
                      <View className="items-end">
                        {report.participated ? (
                          <Text className="text-sm font-bold text-text-main-light dark:text-text-main-dark">
                            {currentPublisher?.is_regular_pioneer || report.is_auxiliary_pioneer ? `${report.hours}h` : "Participó"}
                          </Text>
                        ) : (
                          <Text className="text-sm font-bold text-orange-500">No participó</Text>
                        )}
                        {(currentPublisher?.is_regular_pioneer || report.is_auxiliary_pioneer) && (
                          <Text className="text-[10px] text-text-secondary-light dark:text-text-secondary-dark font-medium uppercase">
                            Participó
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="flex-row items-center justify-center p-3 bg-card-light dark:bg-card-dark rounded-xl border border-border-input-light dark:border-border-input-dark">
                  <Text className="text-sm font-semibold text-text-main-light dark:text-text-main-dark">No hay informes anteriores</Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Floating Button */}
      <View
        className="absolute bottom-0 left-0 w-full p-4 bg-background-light/80 dark:bg-background-dark/80 border-t border-border-input-light dark:border-border-input-dark"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}
      >
        <TouchableOpacity
          onPress={() => handleCreate()}
          activeOpacity={0.8}
          className="w-full flex-row items-center justify-center gap-2 bg-primary h-14 rounded-xl shadow-lg shadow-blue-500/40"
        >
          <MaterialIcons name="send" size={24} color="white" />
          <Text className="text-white text-lg font-bold">Enviar Informe Mensual</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
