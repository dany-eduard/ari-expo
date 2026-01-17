import InputField from "@/components/ui/inputField";
import { Team } from "@/types/team.types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface TeamFormProps {
  initialData?: Partial<Team>;
  onSubmit: (data: Partial<Team>) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

export default function TeamForm({ initialData, onSubmit, isLoading, submitLabel = "Guardar Grupo" }: TeamFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("El nombre del grupo es obligatorio");
      return;
    }
    setError(null);
    try {
      await onSubmit({ name: name.trim() });
    } catch (err) {
      setError("Ocurrió un error al procesar la solicitud");
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header Container aligned with standard max-width */}
      <View className="w-full border-b border-slate-100">
        <View className="max-w-7xl mx-auto w-full px-4 py-3 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-slate-100"
          >
            <MaterialIcons name="close" size={24} color="#0f172a" />
          </TouchableOpacity>
          <Text className="text-base font-bold text-slate-900 tracking-wide">{initialData?.id ? "Editar Grupo" : "Nuevo Grupo"}</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 140 }}>
        <View className="max-w-7xl mx-auto w-full px-6 pt-6">
          {/* Icon Circle */}
          <View className="flex-row justify-center mb-8 mt-4">
            <View
              className="h-20 w-20 rounded-full bg-primary/10 items-center justify-center border border-primary/20"
              style={{
                shadowColor: "#0ea5e9",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
              }}
            >
              <MaterialIcons name="group-add" size={40} color="#2563eb" />
            </View>
          </View>

          {/* Title & Description */}
          <View className="mb-8 items-center md:items-start">
            <Text className="text-slate-900 text-[28px] font-bold leading-tight tracking-tight mb-3 text-center md:text-left">
              Dale un nombre al {initialData?.id ? "grupo" : "nuevo grupo"}
            </Text>
            <Text className="text-slate-500 text-base font-normal leading-relaxed text-center md:text-left">
              {initialData?.id ? "Este es" : "Crea"} un espacio para agrupar y organizar la información de las personas de la congregación.
            </Text>
          </View>

          {/* Form Field using standard InputField component */}
          <View className="flex-col gap-6">
            <View>
              <InputField
                label="Nombre del grupo"
                placeholder="Ej. Equipo de Diseño"
                value={name}
                onChange={(text) => {
                  setName(text);
                  if (error) setError(null);
                }}
                icon="edit"
                iconPosition="left"
              />
              <Text className="text-xs text-slate-500 ml-1 mt-1">Este nombre será visible para todos los miembros.</Text>
              {error && <Text className="text-rose-500 text-xs ml-1 mt-1">{error}</Text>}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Footer with Submit Button */}
      <View
        className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-6"
        style={{ paddingBottom: Math.max(insets.bottom, 24) }}
      >
        <View className="max-w-7xl mx-auto w-full">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
            className={`relative w-full rounded-xl p-4 shadow-lg flex-row items-center justify-center gap-2 ${isLoading ? "bg-slate-300" : "bg-primary"}`}
            style={!isLoading ? { shadowColor: "#2563eb", shadowOpacity: 0.2, shadowRadius: 10, elevation: 4 } : {}}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white text-base font-bold tracking-wide">{submitLabel}</Text>
                <MaterialIcons name="arrow-forward" size={20} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
