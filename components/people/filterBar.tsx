import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface FilterBarProps {
  categories: Record<string, string>;
  activeCategory: string | undefined;
  onSelectCategory: (category: string | undefined) => void;
}

/**
 * FilterBar component for filtering people by category.
 * Compatible with Android, iOS, and Web.
 */
const FilterBar: React.FC<FilterBarProps> = ({ categories, activeCategory, onSelectCategory }) => {
  const allCategories = {
    Todos: "Todos",
    ...categories,
  };

  return (
    <View className="py-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          gap: 8,
          flexDirection: "row",
          alignItems: "center",
        }}
        className="flex-grow-0"
      >
        {Object.entries(allCategories).map(([key, value]) => {
          const isActive = activeCategory === key || (key === "Todos" && !activeCategory);
          return (
            <TouchableOpacity
              key={key}
              onPress={() => onSelectCategory(key === "Todos" ? undefined : key)}
              activeOpacity={0.7}
              className={`flex-row items-center justify-center px-6 py-2.5 rounded-xl border transition-all ${
                isActive ? "bg-primary border-primary" : "bg-white border-slate-200"
              }`}
              style={
                isActive
                  ? {
                      shadowColor: "#2563eb",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.2,
                      shadowRadius: 8,
                      elevation: 4,
                    }
                  : {}
              }
            >
              <Text className={`text-sm font-bold whitespace-nowrap ${isActive ? "text-white" : "text-slate-600"}`}>{value}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default FilterBar;
