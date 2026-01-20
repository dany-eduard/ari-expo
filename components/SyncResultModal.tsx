import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    width: "100%",
    maxWidth: 500,
    maxHeight: "80%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      },
    }),
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    padding: 20,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statCardActivated: {
    backgroundColor: "#f0fdf4",
    borderColor: "#bbf7d0",
  },
  statCardDeactivated: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statLabelActivated: {
    color: "#16a34a",
  },
  statLabelDeactivated: {
    color: "#dc2626",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  statValueActivated: {
    color: "#15803d",
  },
  statValueDeactivated: {
    color: "#b91c1c",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  listContainer: {
    maxHeight: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    backgroundColor: "#f8fafc",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  listItemLast: {
    borderBottomWidth: 0,
  },
  listItemText: {
    fontSize: 14,
    color: "#334155",
    marginLeft: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    padding: 16,
    fontStyle: "italic",
  },
  warningMessage: {
    fontSize: 12,
    color: "#d97706",
    backgroundColor: "#fef3c7",
    padding: 8,
    borderRadius: 6,
    marginBottom: 12,
    fontWeight: "600",
    borderLeftWidth: 3,
    borderLeftColor: "#f59e0b",
  },
});

export default function SyncResultModal({ visible, onClose, toActivate, toDeactivate }: SyncResultModalProps) {
  const activatedCount = toActivate.length;
  const deactivatedCount = toDeactivate.length;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Resultado de Sincronización</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose} activeOpacity={0.7}>
              <MaterialIcons name="close" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <View style={[styles.statCard, styles.statCardActivated]}>
                <Text style={[styles.statLabel, styles.statLabelActivated]}>Activados</Text>
                <Text style={[styles.statValue, styles.statValueActivated]}>{activatedCount}</Text>
              </View>
              <View style={[styles.statCard, styles.statCardDeactivated]}>
                <Text style={[styles.statLabel, styles.statLabelDeactivated]}>Desactivados</Text>
                <Text style={[styles.statValue, styles.statValueDeactivated]}>{deactivatedCount}</Text>
              </View>
            </View>

            {/* Activated List */}
            {activatedCount > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personas por activar</Text>
                <Text style={styles.warningMessage}>
                  ⚠️ Estos publicadores deben ser activados manualmente.{"\n"}Recuerda que deben tener la aprobación del comité de servicio.
                </Text>
                <ScrollView style={styles.listContainer} nestedScrollEnabled showsVerticalScrollIndicator={true}>
                  {toActivate.map((person, index) => (
                    <View key={person.id} style={[styles.listItem, index === toActivate.length - 1 && styles.listItemLast]}>
                      <MaterialIcons name="check-circle" size={18} color="#16a34a" />
                      <Text style={styles.listItemText}>{person.name}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Deactivated List */}
            {deactivatedCount > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Personas desactivadas</Text>
                <ScrollView style={styles.listContainer} nestedScrollEnabled showsVerticalScrollIndicator={true}>
                  {toDeactivate.map((person, index) => (
                    <View key={person.id} style={[styles.listItem, index === toDeactivate.length - 1 && styles.listItemLast]}>
                      <MaterialIcons name="cancel" size={18} color="#dc2626" />
                      <Text style={styles.listItemText}>{person.name}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Empty State */}
            {activatedCount === 0 && deactivatedCount === 0 && (
              <Text style={styles.emptyText}>No se realizaron cambios en el estado de las personas.</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
