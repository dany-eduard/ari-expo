import { MaterialIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export function NoData({ title, handleClearFilters }: { title: string; handleClearFilters?: () => void }) {
  return (
    <View className="flex-1 items-center justify-center py-20">
      <View className="bg-slate-100 p-6 rounded-full mb-4">
        <MaterialIcons name="group-off" size={60} color="#94a3b8" />
      </View>
      <Text className="text-lg font-medium text-slate-600">{title}</Text>
      {handleClearFilters && (
        <TouchableOpacity onPress={handleClearFilters} className="mt-4">
          <Text className="text-primary font-semibold text-base">Limpiar búsqueda</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
