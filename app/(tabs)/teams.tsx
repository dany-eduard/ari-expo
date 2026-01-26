import { ShowAlert } from "@/components/alert";
import { useSession } from "@/components/ctx";
import TeamCard from "@/components/teams/teamCard";
import { Loading } from "@/components/ui/loading";
import { NoData } from "@/components/ui/no-data";
import { teamService } from "@/services/team.service";
import { Person } from "@/types/person.types";
import { Team } from "@/types/team.types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Platform, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TeamsScreen() {
  const { user } = useSession();
  const insets = useSafeAreaInsets();

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [teams, setTeams] = useState<Team[]>([]);
  const { width } = useWindowDimensions();

  const fetchTeams = useCallback(async () => {
    if (!user?.congregation_id) return;
    setIsLoading(true);
    try {
      const data = await teamService.getTeamsByCongregationId(user.congregation_id);
      for (const team of data) {
        team.total_people = team.people.length;
        team.total_active_people = team.people.filter((person: Person) => person.is_active).length;
        delete team.people;
      }
      setTeams(data);
    } catch (error) {
      ShowAlert("Error", "No se pudo obtener la lista de equipos");
      console.error("Error fetching teams:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.congregation_id]);

  const filteredTeams = useMemo(() => {
    return teams.filter((team) => {
      return team.name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [searchTerm, teams]);

  const numColumns = useMemo(() => {
    if (width >= 1024) return 3;
    if (width >= 640) return 2;
    return 1;
  }, [width]);

  const flatListKey = `grid-${numColumns}`;

  const handleClearFilters = () => {
    setSearchTerm("");
  };

  useFocusEffect(
    useCallback(() => {
      fetchTeams();
    }, [fetchTeams]),
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
              <Text className="text-2xl md:text-3xl font-bold tracking-tight text-text-main-light dark:text-text-main-dark">Grupos</Text>
              <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark font-medium">
                Congregación {user?.congregation || ""}
              </Text>
            </View>

            <View className="flex-row items-center gap-2">
              <TouchableOpacity className="w-10 h-10 items-center justify-center rounded-full bg-card-light dark:bg-card-dark border border-border-input-light dark:border-border-input-dark shadow-sm active:bg-slate-100 dark:active:bg-slate-800">
                <MaterialIcons name="filter-list" size={24} color="#2563eb" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Search & Filters */}
          <View className="py-4 flex-col md:flex-row gap-4 items-center  pb-5">
            <View className="relative flex-1 w-full flex-row items-center">
              <View className="absolute left-3 z-10">
                <MaterialIcons name="search" size={20} color="#94a3b8" />
              </View>
              <TextInput
                value={searchTerm}
                onChangeText={setSearchTerm}
                className="flex-1 h-12 pl-10 pr-10 text-base rounded-2xl bg-surface-input-light dark:bg-surface-input-dark border border-border-input-light dark:border-border-input-dark text-text-main-light dark:text-text-main-dark"
                placeholder="Buscar grupo..."
                placeholderTextColor="#94a3b880"
                cursorColor="#2563eb"
                selectionColor="#2563eb"
                textAlignVertical="center"
              />
              <TouchableOpacity className="absolute right-3">
                <MaterialIcons name="tune" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Main Grid List */}
      <View className="flex-1 w-full max-w-7xl mx-auto md:px-6">
        <FlatList
          key={flatListKey}
          data={filteredTeams}
          numColumns={numColumns}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View style={{ flex: 1 / numColumns, padding: 8 }}>
              <TeamCard team={item} onPress={() => router.push(`/teams/${item.id}`)} />
            </View>
          )}
          ListEmptyComponent={isLoading ? <Loading /> : <NoData title="No se encontraron grupos" handleClearFilters={handleClearFilters} />}
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
        onPress={() => router.push("/teams/new")}
      >
        <MaterialIcons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
}
