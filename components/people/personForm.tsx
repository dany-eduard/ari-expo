import { useSession } from "@/components/ctx";
import CheckboxField from "@/components/ui/checkboxField";
import DateField from "@/components/ui/dateField";
import InputField from "@/components/ui/inputField";
import SelectField from "@/components/ui/selectField";
import { teamService } from "@/services/team.service";
import { Person } from "@/types/person.types";
import { Team } from "@/types/team.types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface PersonFormProps {
  isViewing?: boolean;
  initialData?: Partial<Person>;
  onSubmit: (data: Partial<Person>) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export default function PersonForm({
  isViewing = false,
  initialData,
  onSubmit,
  isLoading,
  submitLabel = "Guardar persona",
}: PersonFormProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useSession();

  const [formData, setFormData] = useState<Partial<Person>>({
    first_name: initialData?.first_name || "",
    last_name: initialData?.last_name || "",
    sex: initialData?.sex || undefined,
    number_phone: initialData?.number_phone || undefined,
    birth_date: initialData?.birth_date || undefined,
    baptism_date: initialData?.baptism_date || undefined,
    is_elder: initialData?.is_elder || false,
    is_ministerial_servant: initialData?.is_ministerial_servant || false,
    is_regular_pioneer: initialData?.is_regular_pioneer || false,
    is_special_pioneer: initialData?.is_special_pioneer || false,
    is_field_missionary: initialData?.is_field_missionary || false,
    is_other_sheep: initialData?.is_other_sheep || false,
    is_anointed: initialData?.is_anointed || false,
    team_id: initialData?.team_id || undefined,
    is_active: initialData?.is_active ?? true,
  });

  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);

  const fetchTeams = async () => {
    if (!user?.congregation_id) return;
    setLoadingTeams(true);
    try {
      const data = await teamService.getTeamsByCongregationId(user.congregation_id);
      setTeams(data);
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setLoadingTeams(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [user?.congregation_id]);

  const handleChange = (field: keyof Person, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Mutual exclusion logic
      if (value === true) {
        // Group 1: Elder or Ministerial Servant
        if (field === "is_elder") newData.is_ministerial_servant = false;
        if (field === "is_ministerial_servant") newData.is_elder = false;

        // Group 2: Pioneers/Missionary
        if (field === "is_regular_pioneer") {
          newData.is_special_pioneer = false;
          newData.is_field_missionary = false;
        }
        if (field === "is_special_pioneer") {
          newData.is_regular_pioneer = false;
          newData.is_field_missionary = false;
        }
        if (field === "is_field_missionary") {
          newData.is_regular_pioneer = false;
          newData.is_special_pioneer = false;
        }

        // Group 3: Other Sheep or Anointed
        if (field === "is_other_sheep") newData.is_anointed = false;
        if (field === "is_anointed") newData.is_other_sheep = false;
      }

      return newData;
    });
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  const sexOptions = [
    { label: "Masculino", value: "MALE" },
    { label: "Femenino", value: "FEMALE" },
  ];

  const teamOptions = [
    { label: "Sin asignar", value: "" },
    ...teams.map((team) => ({
      label: team.name,
      value: team.id.toString(),
    })),
  ];

  const isFormValid = () => {
    return formData.first_name && formData.last_name && formData.sex && formData.birth_date && formData.team_id;
  };

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="w-full border-b border-slate-100">
        <View className="max-w-7xl mx-auto w-full px-4 py-3 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-slate-100"
          >
            <MaterialIcons name="close" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text className="text-base font-bold text-slate-900 tracking-wide">
            {initialData?.id ? (isViewing ? "Detalles" : "Editar Persona") : "Crear Nueva Persona"}
          </Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="max-w-7xl mx-auto w-full">
          {/* Profile Photo Placeholder */}
          {/* <View className="p-6 items-center gap-4">
            <TouchableOpacity activeOpacity={0.8} className="relative">
              <View className="h-32 w-32 rounded-full border-4 border-slate-100 bg-slate-50 items-center justify-center overflow-hidden shadow-sm">
                <MaterialIcons name="person" size={64} color="#cbd5e1" />
              </View>
              <View className="absolute bottom-0 right-0 bg-primary p-2 rounded-full border-4 border-white shadow-sm">
                <MaterialIcons name="edit" size={16} color="white" />
              </View>
            </TouchableOpacity>
            <Text className="text-slate-500 text-sm font-medium">Toque para subir foto</Text>
          </View> */}
          <View className="p-6 items-center my-3">
            <View
              className={`h-32 w-32 rounded-full border-4 border-slate-100 items-center justify-center overflow-hidden shadow-sm ${formData.sex === "MALE" ? "bg-blue-400" : formData.sex === "FEMALE" ? "bg-pink-400" : "bg-slate-400"}`}
            >
              <Text className="text-white text-5xl font-bold tracking-tighter">
                {formData.first_name || formData.last_name
                  ? `${formData.first_name?.charAt(0).toUpperCase() || ""}${formData.last_name?.charAt(0).toUpperCase() || ""}`
                  : "NA"}
              </Text>
            </View>
          </View>

          <View className="px-4 gap-6">
            {/* Personal Info */}
            <View className="gap-4">
              <Text className="text-primary text-xs font-bold uppercase tracking-wider px-1">Información Personal</Text>
              <InputField
                label="Nombre *"
                placeholder="Ej. Juan"
                value={formData.first_name || ""}
                onChange={(val) => handleChange("first_name", val)}
                icon="person"
                disabled={isViewing}
              />
              <InputField
                label="Apellidos *"
                placeholder="Ej. Pérez"
                value={formData.last_name || ""}
                onChange={(val) => handleChange("last_name", val)}
                disabled={isViewing}
              />
              <SelectField
                label="Sexo *"
                placeholder="Seleccionar sexo"
                value={formData.sex === "MALE" ? "MALE" : formData.sex === "FEMALE" ? "FEMALE" : ""}
                onChange={(val) => handleChange("sex", val)}
                options={sexOptions}
                disabled={isViewing}
              />
              <InputField
                label="Número de teléfono"
                placeholder="Ej. 1234567890"
                value={formData.number_phone || ""}
                onChange={(val) => handleChange("number_phone", val)}
                icon="phone"
                disabled={isViewing}
              />
            </View>

            <View className="h-[1px] w-full bg-slate-100 my-2" />

            {/* Important Dates */}
            <View className="gap-4">
              <Text className="text-primary text-xs font-bold uppercase tracking-wider px-1">Fechas Importantes</Text>
              <DateField
                label="Fecha de Nacimiento *"
                placeholder="Seleccionar fecha"
                value={formData.birth_date ? formData.birth_date.toString() : ""}
                onChange={(val) => handleChange("birth_date", val)}
                icon="calendar-today"
                disabled={isViewing}
              />
              <DateField
                label="Fecha de Bautismo"
                placeholder="Seleccionar fecha"
                value={formData.baptism_date ? formData.baptism_date.toString() : ""}
                onChange={(val) => handleChange("baptism_date", val)}
                icon="opacity"
                disabled={isViewing}
              />
            </View>

            <View className="h-[1px] w-full bg-slate-100 my-2" />

            {/* Privileges & Status */}
            <View className="gap-4">
              <Text className="text-primary text-xs font-bold uppercase tracking-wider px-1">Privilegios y Estado</Text>
              <View className="gap-2">
                <CheckboxField
                  label="Anciano"
                  value={!!formData.is_elder}
                  onChange={(val) => handleChange("is_elder", val)}
                  disabled={isViewing}
                />
                <CheckboxField
                  label="Siervo Ministerial"
                  value={!!formData.is_ministerial_servant}
                  onChange={(val) => handleChange("is_ministerial_servant", val)}
                  disabled={isViewing}
                />
                <CheckboxField
                  label="Precursor Regular"
                  value={!!formData.is_regular_pioneer}
                  onChange={(val) => handleChange("is_regular_pioneer", val)}
                  disabled={isViewing}
                />
                <CheckboxField
                  label="Precursor Especial"
                  value={!!formData.is_special_pioneer}
                  onChange={(val) => handleChange("is_special_pioneer", val)}
                  disabled={isViewing}
                />
                <CheckboxField
                  label="Misionero"
                  value={!!formData.is_field_missionary}
                  onChange={(val) => handleChange("is_field_missionary", val)}
                  disabled={isViewing}
                />
                <CheckboxField
                  label="Otras Ovejas"
                  value={!!formData.is_other_sheep}
                  onChange={(val) => handleChange("is_other_sheep", val)}
                  disabled={isViewing}
                />
                <CheckboxField
                  label="Ungido"
                  value={!!formData.is_anointed}
                  onChange={(val) => handleChange("is_anointed", val)}
                  disabled={isViewing}
                />
                <CheckboxField
                  label="Activo"
                  value={!!formData.is_active}
                  onChange={(val) => handleChange("is_active", val)}
                  disabled={isViewing}
                />
              </View>
            </View>

            <View className="h-[1px] w-full bg-slate-100 my-2" />

            {/* Assignment */}
            <View className="gap-4">
              <Text className="text-primary text-xs font-bold uppercase tracking-wider px-1">Asignación</Text>
              <View>
                {loadingTeams ? (
                  <ActivityIndicator color="#2563eb" />
                ) : (
                  <SelectField
                    label="Grupo de Servicio *"
                    placeholder="Seleccionar grupo"
                    value={formData.team_id?.toString() || ""}
                    onChange={(val) => handleChange("team_id", val ? parseInt(val) : undefined)}
                    options={teamOptions}
                    disabled={isViewing}
                  />
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      {!isViewing && (
        <View
          className="absolute bottom-0 left-0 right-0 p-4 bg-white/95 border-t border-slate-100"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading || !isFormValid()}
            activeOpacity={0.8}
            className={`h-14 rounded-xl flex-row items-center justify-center gap-2 shadow-lg ${isLoading || !isFormValid() ? "bg-slate-300" : "bg-primary"}`}
            style={!isLoading ? { shadowColor: "#2563eb", shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 } : {}}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <MaterialIcons name="save" size={24} color="white" />
                <Text className="text-white font-bold text-lg">{submitLabel}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
