import { MaterialIcons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export function NoData({
  title,
  handleClearFilters,
  icon = "group-off",
}: {
  title: string;
  handleClearFilters?: () => void;
  icon?: ComponentProps<typeof MaterialIcons>["name"];
}) {
  return (
    <View className="flex-1 items-center justify-center py-20">
      <View className="bg-surface-input-light dark:bg-surface-input-dark p-6 rounded-full mb-4">
        <MaterialIcons name={icon} size={60} color="#94a3b8" className="dark:text-slate-500" />
      </View>
      <Text className="text-lg font-medium text-text-secondary-light dark:text-text-secondary-dark">{title}</Text>
      {handleClearFilters && (
        <TouchableOpacity onPress={handleClearFilters} className="mt-4">
          <Text className="text-primary font-semibold text-base">Limpiar búsqueda</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
