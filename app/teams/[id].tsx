import { ShowAlert } from "@/components/alert";
import PersonCard from "@/components/people/personCard";
import { Loading } from "@/components/ui/loading";
import { NoData } from "@/components/ui/no-data";
import { teamService } from "@/services/team.service";
import { Person } from "@/types/person.types";
import { Team } from "@/types/team.types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { FlatList, Modal, Text, TouchableOpacity, View, useColorScheme, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TeamDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [menuVisible, setMenuVisible] = useState(false);

  const fetchTeam = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await teamService.getTeamById(id);
      data.total_people = data.people.length;
      data.total_active_people = data.people.filter((person: Person) => person.is_active).length;
      data.people.sort((a: Person, b: Person) => a.last_name.localeCompare(b.last_name));
      setTeam(data);
    } catch (error) {
      console.error("Error fetching team:", error);
      ShowAlert("Error", "No se pudo cargar la información del grupo");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      fetchTeam();
    }, [fetchTeam]),
  );

  const handleDeleteGroup = () => {
    ShowAlert("Confirmar", "¿Estás seguro de que deseas eliminar este grupo?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await teamService.deleteTeam(id);
            ShowAlert("Éxito", "Grupo eliminado correctamente");
            router.back();
          } catch (error) {
            ShowAlert("Error", "No se pudo eliminar el grupo");
          }
        },
      },
    ]);
  };

  const TeamMenu = () => (
    <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
      <TouchableOpacity style={{ flex: 1 }} onPress={() => setMenuVisible(false)} activeOpacity={1}>
        <View
          style={{
            position: "absolute",
            top: (insets?.top || 0) + 50,
            right: 16,
            width: 200,
            backgroundColor: colorScheme === "dark" ? "#1e293b" : "white",
            borderRadius: 12,
            padding: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
            borderWidth: 1,
            borderColor: colorScheme === "dark" ? "#334155" : "#f1f5f9",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setMenuVisible(false);
              router.push(`/teams/edit/${id}`);
            }}
            className="p-3 border-b border-border-input-light dark:border-border-input-dark flex-row items-center gap-3 active:bg-slate-50 dark:active:bg-slate-800 rounded-t-lg"
          >
            <MaterialIcons name="edit" size={20} color="#64748b" className="dark:text-slate-400" />
            <Text className="text-text-main-light dark:text-text-main-dark font-medium text-sm">Editar grupo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setMenuVisible(false);
              handleDeleteGroup();
            }}
            className="p-3 flex-row items-center gap-3 active:bg-slate-50 dark:active:bg-slate-800 rounded-b-lg"
          >
            <MaterialIcons name="delete" size={20} color="#e11d48" />
            <Text className="text-rose-600 font-medium text-sm">Eliminar grupo</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const numColumns = useMemo(() => {
    if (width >= 1024) return 3;
    if (width >= 640) return 2;
    return 1;
  }, [width]);

  if (isLoading) return <Loading />;
  if (!team)
    return (
      <View className="flex-1 items-center justify-center">
        <Text>No se encontró el grupo</Text>
      </View>
    );

  const renderHeader = () => (
    <View className="p-6 bg-background-light dark:bg-background-dark">
      {/* Header Section */}
      <View className="flex-row items-center gap-4 mb-8">
        <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center">
          <MaterialIcons name="group" size={32} color="#2563eb" />
        </View>
        <View className="flex-1">
          <Text className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">{team.name}</Text>
          <Text className="text-text-secondary-light dark:text-text-secondary-dark font-medium">
            Congregación {team?.congregation?.name}
          </Text>
        </View>
      </View>

      {/* Info Grid */}
      <View className="flex-row gap-4 mb-8">
        <View className="flex-1 p-4 bg-card-light dark:bg-card-dark rounded-2xl border border-border-input-light dark:border-border-input-dark">
          <Text className="text-text-secondary-light dark:text-text-secondary-dark text-sm font-semibold mb-1">Miembros</Text>
          <Text className="text-2xl font-bold text-text-main-light dark:text-text-main-dark">{team.total_people || 0}</Text>
        </View>
        <View className="flex-1 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
          <Text className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold mb-1">Activos</Text>
          <Text className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{team.total_active_people || 0}</Text>
        </View>
      </View>

      {/* People List */}
      {team.people.length > 0 && (
        <Text className="text-text-main-light dark:text-text-main-dark text-lg font-bold leading-tight tracking-tight mt-4 mb-2">
          Miembros del grupo
        </Text>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <Stack.Screen
        options={{
          title: team.name,
          headerRight: () => (
            <TouchableOpacity onPress={() => setMenuVisible(true)} className="p-2 mr-2">
              <MaterialIcons name="more-vert" size={24} color={colorScheme === "dark" ? "#cbd5e1" : "#1e293b"} />
            </TouchableOpacity>
          ),
        }}
      />

      <TeamMenu />

      <FlatList
        data={team.people}
        keyExtractor={(item) => item.id.toString()}
        key={`grid-${numColumns}`}
        numColumns={numColumns}
        ListHeaderComponent={renderHeader}
        stickyHeaderIndices={[0]}
        renderItem={({ item }) => (
          <View style={{ flex: 1 / numColumns, paddingHorizontal: 16, paddingBottom: 16 }}>
            <PersonCard person={item} onDelete={fetchTeam} onPress={() => router.push(`/people/${item.id}/reports/record`)} />
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 160, marginBottom: 10 }}
        ListEmptyComponent={<NoData title="No hay personas en este grupo" />}
        className="flex-1"
      />
    </View>
  );
}
