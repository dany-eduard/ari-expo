import { ShowAlert } from "@/components/alert";
import { ThemedView } from "@/components/themed-view";
import { congregationService } from "@/services/congregation.service";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const styles = StyleSheet.create({
  card: {
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

const MaterialIcon = ({ name, size = 24, color, className }: { name: string; size?: number; color?: string; className?: string }) => {
  return <MaterialIcons name={name as any} size={size} color={color} className={className} />;
};

export default function CongregationsScreen() {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [congregations, setCongregations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Edit State
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchCongregations = useCallback(
    async (pageNum = 1, shouldRefresh = false) => {
      try {
        if (pageNum === 1 && !shouldRefresh) setIsLoading(true);
        const response = await congregationService.getCongregations({
          page: pageNum,
          limit: 15,
          search: search.trim() || undefined,
          includeCount: true,
        });

        if (pageNum === 1) {
          setCongregations(response.data);
        } else {
          setCongregations((prev) => [...prev, ...response.data]);
        }
        setTotal(response.meta.total);
        setPage(pageNum);
      } catch (error) {
        console.error("Error fetching congregations:", error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    },
    [search],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCongregations(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [fetchCongregations]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchCongregations(1, true);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && congregations.length < total) {
      setIsLoadingMore(true);
      fetchCongregations(page + 1);
    }
  };

  const handleDelete = async (item: any) => {
    if (item._count.people > 0) {
      ShowAlert("No se puede eliminar", "Esta congregación tiene publicadores asociados.");
      return;
    }

    ShowAlert("Eliminar congregación", `¿Estás seguro de que deseas eliminar la congregación "${item.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            await congregationService.deleteCongregation(item.id);
            fetchCongregations(1, true);
          } catch (error: any) {
            ShowAlert("Error", error.message);
          }
        },
      },
    ]);
  };

  const handleUpdate = async () => {
    if (!editingItem || !newName.trim()) return;
    setIsUpdating(true);
    try {
      await congregationService.updateCongregation(editingItem.id, {
        name: newName.trim(),
        code: newCode.trim() || undefined,
      });
      setEditingItem(null);
      fetchCongregations(1, true);
    } catch (error: any) {
      ShowAlert("Error", error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View
      style={styles.card}
      className="bg-white dark:bg-slate-900 mx-4 mb-4 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
    >
      <View className="p-4">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Text className="text-lg font-bold text-text-main-light dark:text-text-main-dark">{item.name}</Text>
            <Text className="text-sm text-slate-500 font-medium">Código: {item.code || "N/A"}</Text>
          </View>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => {
                setEditingItem(item);
                setNewName(item.name);
                setNewCode(item.code || "");
              }}
              className="w-9 h-9 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/30"
            >
              <MaterialIcon name="edit" size={18} color="#2563eb" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              className="w-9 h-9 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/30"
            >
              <MaterialIcon name="delete" size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-row items-center gap-4 mt-2">
          <View className="flex-row items-center gap-1.5">
            <MaterialIcon name="group" size={16} color="#64748b" />
            <Text className="text-xs text-slate-500">{item._count.people} publicadores</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <MaterialIcon name="calendar-today" size={14} color="#64748b" />
            <Text className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <ThemedView className="flex-1">
      <View
        className="z-50 bg-background-light dark:bg-card-dark border-b border-border-input-light dark:border-border-input-dark"
        style={{ paddingTop: insets.top + 14 }}
      >
        <View className="flex-row items-center px-4 pb-4 gap-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800"
          >
            <MaterialIcon name="arrow-back" size={24} color="#64748b" className="dark:text-slate-400" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-text-main-light dark:text-text-main-dark">Congregaciones</Text>
        </View>

        <View className="px-4 pb-4">
          <View className="flex-row items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2">
            <MaterialIcon name="search" size={20} color="#64748b" />
            <TextInput
              className="flex-1 ml-2 text-text-main-light text-base rounded dark:text-text-main-dark"
              placeholder="Buscar por nombre o código..."
              placeholderTextColor="#94a3b8"
              value={search}
              onChangeText={setSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <MaterialIcon name="close" size={20} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <FlatList
        data={congregations}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingVertical: 16 }}
        onRefresh={handleRefresh}
        refreshing={isRefreshing}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={isLoadingMore ? <ActivityIndicator size="small" color="#2563eb" className="py-4" /> : null}
        ListEmptyComponent={
          !isLoading ? (
            <View className="py-20 items-center">
              <MaterialIcon name="info-outline" size={48} color="#94a3b8" />
              <Text className="text-slate-500 mt-2">No se encontraron congregaciones</Text>
            </View>
          ) : (
            <View className="py-20">
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          )
        }
      />

      {/* Edit Modal */}
      <Modal visible={!!editingItem} transparent animationType="fade" onRequestClose={() => setEditingItem(null)}>
        <View className="flex-1 bg-black/50 items-center justify-center p-6">
          <View className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6">
            <Text className="text-lg font-bold text-text-main-light dark:text-text-main-dark mb-4">Editar congregación</Text>
            <View className="gap-4">
              <View>
                <Text className="text-sm font-medium text-slate-500 mb-1 ml-1">Nombre</Text>
                <TextInput
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-text-main-light dark:text-text-main-dark"
                  value={newName}
                  onChangeText={setNewName}
                  autoFocus
                />
              </View>
              <View>
                <Text className="text-sm font-medium text-slate-500 mb-1 ml-1">Código</Text>
                <TextInput
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-text-main-light dark:text-text-main-dark"
                  value={newCode}
                  onChangeText={setNewCode}
                  placeholder="Ej: ABC-123"
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </View>
            <View className="flex-row gap-3 mt-6">
              <TouchableOpacity
                onPress={() => setEditingItem(null)}
                className="flex-1 py-3 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800"
              >
                <Text className="font-bold text-slate-600 dark:text-slate-400">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdate}
                disabled={isUpdating || !newName.trim()}
                className="flex-1 py-3 items-center justify-center rounded-xl bg-primary"
              >
                {isUpdating ? <ActivityIndicator color="white" /> : <Text className="font-bold text-white">Guardar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}
