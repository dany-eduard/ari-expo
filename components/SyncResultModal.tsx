import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Modal, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface PersonSyncItem {
  id: number;
  name: string;
}

interface SyncResultModalProps {
  visible: boolean;
  onClose: () => void;
  toActivate: PersonSyncItem[];
  toDeactivate: PersonSyncItem[];
}

export default function SyncResultModal({ visible, onClose, toActivate, toDeactivate }: SyncResultModalProps) {
  const activatedCount = toActivate.length;
  const deactivatedCount = toDeactivate.length;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View
          style={{
            ...Platform.select({
              ios: { boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)" },
              android: { elevation: 8 },
              web: { boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" },
            }),
          }}
          className="bg-background-light dark:bg-card-dark rounded-2xl w-full max-w-[500px] max-h-[80%] overflow-hidden"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between p-5 border-b border-border-input-light dark:border-border-input-dark">
            <Text className="text-lg font-bold text-text-main-light dark:text-text-main-dark flex-1">Resultado de Sincronización</Text>
            <TouchableOpacity
              className="w-8 h-8 rounded-full bg-surface-input-light dark:bg-surface-input-dark items-center justify-center"
              onPress={onClose}
              activeOpacity={0.7}
            >
              <MaterialIcons name="close" size={20} color="#64748b" className="dark:text-slate-400" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView className="p-5" showsVerticalScrollIndicator={false}>
            {/* Stats Cards */}
            <View className="flex-row gap-3 mb-5">
              <View className="flex-1 p-4 rounded-xl border border-green-200 dark:border-green-900/30 bg-green-50 dark:bg-green-500/10">
                <Text className="text-[10px] font-bold uppercase tracking-wider mb-1 text-green-600 dark:text-green-400">Activados</Text>
                <Text className="text-2xl font-bold text-green-800 dark:text-green-300">{activatedCount}</Text>
              </View>
              <View className="flex-1 p-4 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-500/10">
                <Text className="text-[10px] font-bold uppercase tracking-wider mb-1 text-red-600 dark:text-red-400">Desactivados</Text>
                <Text className="text-2xl font-bold text-red-800 dark:text-red-300">{deactivatedCount}</Text>
              </View>
            </View>

            {/* Activated List */}
            {activatedCount > 0 && (
              <View className="mb-5">
                <Text className="text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark mb-3 uppercase tracking-wider">
                  Personas por activar
                </Text>
                <Text className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 p-2 rounded-lg mb-3 font-semibold border-l-2 border-amber-500">
                  ⚠️ Estos publicadores deben ser activados manualmente.{"\n"}Recuerda que deben tener la aprobación del comité de servicio.
                </Text>
                <View className="max-h-52 rounded-lg border border-border-input-light dark:border-border-input-dark bg-surface-input-light dark:bg-slate-900/50">
                  <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={true}>
                    {toActivate.map((person, index) => (
                      <View
                        key={person.id}
                        className={`flex-row items-center p-3 border-b border-border-input-light dark:border-border-input-dark ${index === toActivate.length - 1 ? "border-b-0" : ""}`}
                      >
                        <MaterialIcons name="check-circle" size={18} color="#16a34a" />
                        <Text className="text-sm text-text-main-light dark:text-text-main-dark ml-2">{person.name}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}

            {/* Deactivated List */}
            {deactivatedCount > 0 && (
              <View className="mb-5">
                <Text className="text-sm font-bold text-text-secondary-light dark:text-text-secondary-dark mb-3 uppercase tracking-wider">
                  Personas desactivadas
                </Text>
                <View className="max-h-52 rounded-lg border border-border-input-light dark:border-border-input-dark bg-surface-input-light dark:bg-slate-900/50">
                  <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={true}>
                    {toDeactivate.map((person, index) => (
                      <View
                        key={person.id}
                        className={`flex-row items-center p-3 border-b border-border-input-light dark:border-border-input-dark ${index === toDeactivate.length - 1 ? "border-b-0" : ""}`}
                      >
                        <MaterialIcons name="cancel" size={18} color="#dc2626" />
                        <Text className="text-sm text-text-main-light dark:text-text-main-dark ml-2">{person.name}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}

            {/* Empty State */}
            {activatedCount === 0 && deactivatedCount === 0 && (
              <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark text-center p-4 italic">
                No se realizaron cambios en el estado de las personas.
              </Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
