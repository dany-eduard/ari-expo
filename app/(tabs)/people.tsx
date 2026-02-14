import { useSession } from "@/components/ctx";
import FilterBar from "@/components/people/filterBar";
import PersonCard from "@/components/people/personCard";
import { Loading } from "@/components/ui/loading";
import { NoData } from "@/components/ui/no-data";
import { PERSON_CATEGORIES } from "@/constants/person";
import { personService } from "@/services/person.service";
import { Categories, Person } from "@/types/person.types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Platform, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function PeopleScreen() {
  const { user } = useSession();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<keyof Categories | "is_inactive" | "is_male" | "not_sent_last_report">();
  const [people, setPeople] = useState<Person[]>([]);

  const fetchPeople = useCallback(async () => {
    if (!user?.congregation_id) return;
    setIsLoading(true);
    try {
      const people = await personService.getPersonsByCongregationId(user.congregation_id);
      people.sort((a: Person, b: Person) => a.last_name.localeCompare(b.last_name));
      setPeople(people);
    } catch (error) {
      console.error("Error fetching people:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.congregation_id]);

  const filteredPeople = useMemo(() => {
    return people.filter((person) => {
      const fullName = `${person.first_name || ""} ${person.last_name || ""}`;
      const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase());
      if (!activeCategory) return matchesSearch;
      let matchesCategory = false;

      if (activeCategory === "is_inactive") {
        matchesCategory = person.is_active === false;
      } else if (activeCategory === "is_male") {
        matchesCategory = person.sex === "MALE";
      } else if (activeCategory === "is_female") {
        matchesCategory = person.sex === "FEMALE";
      } else if (activeCategory === "not_sent_last_report") {
        matchesCategory = person.already_sent_last_report === false && person.is_active === true;
      } else {
        matchesCategory = (person[activeCategory as keyof Person] as unknown) === true;
      }
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory, people]);

  const numColumns = useMemo(() => {
    if (width >= 1024) return 3;
    if (width >= 640) return 2;
    return 1;
  }, [width]);

  // key prop for FlatList to force re-render when columns change
  const flatListKey = `grid-${numColumns}`;

  const handleClearFilters = () => {
    setSearchTerm("");
    setActiveCategory(undefined);
  };

  useFocusEffect(
    useCallback(() => {
      fetchPeople();
    }, [fetchPeople]),
  );

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark" style={{ paddingTop: insets.top + 14 }}>
      {/* Sticky Responsive Header */}
      <View
        className="z-50 bg-background-light/90 dark:bg-card-dark/90 border-b border-border-input-light dark:border-border-input-dark"
        style={Platform.OS === "web" ? { position: "sticky", top: 0 } : {}}
      >
        <View className="gap-3 max-w-7xl mx-auto w-full px-4 md:px-6">
          <View className="flex-row items-center md:pt-6 pb-2 justify-between">
            <View>
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl md:text-3xl font-bold tracking-tight text-text-main-light dark:text-text-main-dark">
                  Personas
                </Text>
                <View className="bg-primary/10 px-3 py-1 rounded-full">
                  <Text className="text-sm font-semibold text-primary">{filteredPeople.length}</Text>
                </View>
              </View>
              <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark font-medium">
                Congregación {user?.congregation || ""}
              </Text>
            </View>

            <View className="flex-row items-center gap-3">
              <TouchableOpacity className="w-11 h-11 items-center justify-center rounded-full active:bg-slate-100 dark:active:bg-slate-800">
                <MaterialIcons name="notifications-none" size={24} color="#64748b" className="dark:text-slate-400" />
              </TouchableOpacity>

              {/* Desktop Add Button */}
              <TouchableOpacity
                className="hidden md:flex flex-row items-center gap-2 bg-primary px-4 py-2 rounded-xl"
                onPress={() => router.push("/people/new")}
              >
                <MaterialIcons name="add" size={20} color="white" />
                <Text className="text-white font-semibold">Añadir Persona</Text>
              </TouchableOpacity>

              {/* Mobile Add Button */}
              <TouchableOpacity
                className="md:hidden w-11 h-11 bg-primary/10 items-center justify-center rounded-full"
                onPress={() => router.push("/people/new")}
              >
                <MaterialIcons name="add" size={24} color="#2563eb" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search & Filters */}
          <View className="py-4 flex-col md:flex-row gap-8 items-center">
            <View className="relative flex-1 w-full flex-row items-center">
              <View className="absolute left-3 z-10">
                <MaterialIcons name="search" size={20} color="#94a3b8" />
              </View>
              <TextInput
                value={searchTerm}
                onChangeText={setSearchTerm}
                className="flex-1 h-12 pl-10 pr-10 text-base rounded-2xl bg-surface-input-light dark:bg-surface-input-dark border border-border-input-light dark:border-border-input-dark text-text-main-light dark:text-text-main-dark"
                placeholder="Buscar por nombre..."
                placeholderTextColor="#94a3b880"
                cursorColor="#2563eb"
                selectionColor="#2563eb"
                textAlignVertical="center"
              />
              <TouchableOpacity className="absolute right-3">
                <MaterialIcons name="tune" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <View className="w-full md:w-auto overflow-hidden">
              <FilterBar
                categories={{ ...PERSON_CATEGORIES, is_inactive: "Inactivos", not_sent_last_report: "Sin último reporte enviado" }}
                activeCategory={activeCategory!}
                onSelectCategory={(cat) => setActiveCategory(cat as keyof Categories | "is_inactive" | "is_male" | "not_sent_last_report")}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Main Grid List */}
      <View className="flex-1 w-full max-w-7xl mx-auto md:px-6">
        <FlatList
          key={flatListKey}
          data={filteredPeople}
          numColumns={numColumns}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View
              style={{
                flex: 1 / numColumns,
                padding: 8,
              }}
            >
              <PersonCard person={item} onDelete={fetchPeople} onPress={() => router.push(`/people/${item.id}/reports/new`)} />
            </View>
          )}
          ListEmptyComponent={
            isLoading ? <Loading /> : <NoData title="No se encontraron personas" handleClearFilters={handleClearFilters} />
          }
        />
      </View>

      {/* Mobile Floating Action Button */}
      <TouchableOpacity
        className="fixed bottom-8 right-8 h-16 w-16 rounded-full bg-primary items-center justify-center shadow-2xl z-40 md:h-14 md:w-14"
        activeOpacity={0.8}
        style={{
          shadowColor: "#2563eb",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.4,
          shadowRadius: 20,
          elevation: 10,
          position: "absolute",
          bottom: 32,
          right: 32,
        }}
        onPress={() => router.push("/people/new")}
      >
        <MaterialIcons name="person-add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}
