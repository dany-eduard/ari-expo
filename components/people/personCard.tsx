import { Person } from "@/types/person.types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link, usePathname } from "expo-router";
import React, { useState } from "react";
import { Modal, Pressable, Text, TextInput, TouchableOpacity, View } from "react-native";

import { ShowAlert } from "@/components/alert";
import { useHasPermission } from "@/hooks/useHasPermission";
import { personService } from "@/services/person.service";

interface PersonCardProps {
  person: Person;
  onPress?: () => void;
  onDelete?: () => void;
}

const DeleteConfirmationModal = ({
  visible,
  onClose,
  onConfirm,
  personName,
}: {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  personName: string;
}) => {
  const [inputValue, setInputValue] = useState("");
  const isValid = inputValue.trim().toLowerCase() === personName.trim().toLowerCase();

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 bg-black/50 items-center justify-center p-4" onPress={onClose}>
        <Pressable className="w-full max-w-sm bg-white dark:bg-card-dark rounded-2xl p-6" onPress={(e) => e.stopPropagation()}>
          <View className="items-center mb-4">
            <View className="bg-red-50 dark:bg-red-900/20 p-3 rounded-full mb-3">
              <MaterialIcons name="delete-forever" size={32} color="#ef4444" />
            </View>
            <Text className="text-xl font-bold text-slate-900 dark:text-slate-100 text-center">Confirmar eliminación</Text>
          </View>

          <Text className="text-slate-500 dark:text-slate-400 text-center mb-6">
            Para confirmar, escribe el nombre completo de la persona:{"\n"}
            <Text className="font-bold text-slate-900 dark:text-slate-100">{personName}</Text>
          </Text>

          <TextInput
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-slate-100 mb-6"
            placeholder="Escribe el nombre aquí"
            placeholderTextColor="#94a3b8"
            value={inputValue}
            onChangeText={setInputValue}
            autoFocus
          />

          <View className="flex-row gap-3">
            <TouchableOpacity
              className="flex-1 p-4 rounded-xl items-center justify-center bg-slate-100 dark:bg-slate-800"
              onPress={onClose}
            >
              <Text className="text-slate-600 dark:text-slate-300 font-bold">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`flex-1 p-4 rounded-xl items-center justify-center ${isValid ? "bg-red-500" : "bg-red-200 dark:bg-red-900/40"}`}
              onPress={onConfirm}
              disabled={!isValid}
            >
              <Text className="text-white font-bold text-center">Eliminar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const getBadgeStyles = (dept: string) => {
  switch (dept) {
    case "is_regular_pioneer":
      return "bg-green-200 border-green-300 text-green-700";
    case "is_elder":
      return "bg-blue-200 border-blue-300 text-blue-700";
    case "is_ministerial_servant":
      return "bg-orange-200 border-orange-300 text-orange-700";
    case "is_special_pioneer":
      return "bg-rose-200 border-rose-300 text-rose-700";
    case "is_field_missionary":
      return "bg-rose-200 border-rose-300 text-rose-700";
    default:
      return "bg-slate-200 border-slate-300 text-slate-700";
  }
};

const MenuOptions = ({
  person,
  visible,
  onClose,
  position,
  onDelete,
}: {
  person: Person;
  visible: boolean;
  onClose: () => void;
  position: { top: number; right: number };
  onDelete?: () => void;
}) => {
  const pathname = usePathname();
  const canDelete = useHasPermission("PERSON_DELETE");
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const itsOnTeamsScreen = pathname.includes("teams");
  const itsOnPeopleScreen = pathname.includes("people");

  const fullName = `${person.first_name.trim()} ${person.last_name.trim()}`;

  const handleDeleteConfirm = async () => {
    setDeleteModalVisible(false);
    try {
      await personService.deletePerson(person.id);
      ShowAlert("Éxito", "La persona ha sido eliminada correctamente.");
      if (onDelete) onDelete();
      // Note: Ideally we should trigger a refresh here, but PersonCard is a leaf.
      // If the parent uses useFocusEffect or has a local state, it will refresh.
    } catch (error) {
      console.error("Error deleting person:", error);
      ShowAlert("Error", "No se pudo eliminar a la persona.");
    }
  };

  return (
    <>
      <DeleteConfirmationModal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleDeleteConfirm}
        personName={fullName}
      />
      <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
        <Pressable style={{ flex: 1, backgroundColor: "transparent" }} onPress={onClose}>
          <View
            style={{
              position: "absolute",
              top: position.top,
              right: position.right,
              width: 180,
              backgroundColor: "white",
              borderRadius: 12,
              padding: 4,
              boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
              elevation: 5,
              borderWidth: 1,
              borderColor: "#f1f5f9",
            }}
            className="dark:bg-card-dark dark:border-border-input-dark"
          >
            {itsOnPeopleScreen && (
              <Link href={`/people/${person.id}/reports/record`} asChild>
                <TouchableOpacity
                  className="p-3 flex-row items-center gap-3 active:bg-slate-50 dark:active:bg-slate-800 rounded-lg"
                  onPress={onClose}
                >
                  <MaterialIcons name="history" size={20} color="#64748b" className="dark:text-slate-400" />
                  <Text className="text-slate-700 dark:text-slate-200 font-medium text-sm">Ver registro</Text>
                </TouchableOpacity>
              </Link>
            )}
            {itsOnTeamsScreen && (
              <Link href={`/people/${person.id}/reports/new`} asChild>
                <TouchableOpacity
                  className="p-3 flex-row items-center gap-3 active:bg-slate-50 dark:active:bg-slate-800 rounded-lg"
                  onPress={onClose}
                >
                  <MaterialIcons name="post-add" size={20} color="#64748b" className="dark:text-slate-400" />
                  <Text className="text-slate-700 dark:text-slate-200 font-medium text-sm">Agregar registro</Text>
                </TouchableOpacity>
              </Link>
            )}
            <Link href={`/people/${person.id}?view=true`} asChild>
              <TouchableOpacity
                className="p-3 flex-row items-center gap-3 active:bg-slate-50 dark:active:bg-slate-800 rounded-lg"
                onPress={onClose}
              >
                <MaterialIcons name="visibility" size={20} color="#64748b" className="dark:text-slate-400" />
                <Text className="text-slate-700 dark:text-slate-200 font-medium text-sm">Ver detalles</Text>
              </TouchableOpacity>
            </Link>
            <Link href={`/people/${person.id}?edit=true`} asChild>
              <TouchableOpacity
                className="p-3 flex-row items-center gap-3 active:bg-slate-50 dark:active:bg-slate-800 rounded-lg"
                onPress={onClose}
              >
                <MaterialIcons name="edit" size={20} color="#64748b" className="dark:text-slate-400" />
                <Text className="text-slate-700 dark:text-slate-200 font-medium text-sm">Editar</Text>
              </TouchableOpacity>
            </Link>
            {canDelete && (
              <TouchableOpacity
                className="p-3 flex-row items-center gap-3 active:bg-red-50 dark:active:bg-red-900/20 rounded-lg"
                onPress={() => {
                  onClose();
                  setDeleteModalVisible(true);
                }}
              >
                <MaterialIcons name="delete-outline" size={20} color="#ef4444" />
                <Text className="text-red-500 font-medium text-sm">Eliminar</Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const PersonCard: React.FC<PersonCardProps> = ({ person, onPress, onDelete }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const buttonRef = React.useRef<View>(null);

  const handleOpenMenu = () => {
    buttonRef.current?.measure((x, y, width, height, pageX, pageY) => {
      setMenuPosition({
        top: pageY + height - 40, // 4px offset below button
        right: 16, // Fixed right margin from screen edge generally safer than calculating specific x
      });
      setMenuVisible(true);
    });
  };

  return (
    <>
      <MenuOptions
        person={person}
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        position={menuPosition}
        onDelete={onDelete}
      />
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        className="flex flex-row items-center gap-4 bg-card-light dark:bg-card-dark p-4 rounded-2xl border border-border-input-light dark:border-border-input-dark"
        style={{
          boxShadow: "0px 2px 10px rgba(15, 23, 42, 0.05)",
          elevation: 2,
        }}
      >
        <View className="relative">
          <View
            className={`flex items-center justify-center h-14 w-14 rounded-full border-2 border-white dark:border-slate-700 ${person.sex === "MALE" ? "bg-blue-400" : "bg-pink-400"}`}
          >
            <Text className="text-white font-bold text-lg">
              {person.first_name?.charAt(0).toUpperCase() + person.last_name?.charAt(0).toUpperCase()}
            </Text>
          </View>

          {!person.already_sent_last_report && (
            <View className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-red-400 border-[3px] border-white dark:border-slate-700" />
          )}
        </View>

        <View className="flex-1 flex-col justify-center">
          <View className="flex flex-row justify-between items-center mb-1">
            <Text className="text-text-main-light dark:text-text-main-dark text-base font-bold flex-1 mr-2" numberOfLines={1}>
              {person.first_name.trim() + " " + person.last_name.trim()}
            </Text>
          </View>

          <View className="flex flex-row items-center gap-2">
            {person.is_regular_pioneer && (
              <View className={`px-2 py-0.5 rounded-full border ${getBadgeStyles("is_regular_pioneer")}`}>
                <Text className="text-[10px] font-bold">Precursor Regular</Text>
              </View>
            )}
            {person.is_elder && (
              <View className={`px-2 py-0.5 rounded-full border ${getBadgeStyles("is_elder")}`}>
                <Text className="text-[10px] font-bold">Anciano</Text>
              </View>
            )}
            {person.is_ministerial_servant && (
              <View className={`px-2 py-0.5 rounded-full border ${getBadgeStyles("is_ministerial_servant")}`}>
                <Text className="text-[10px] font-bold">Servicio Ministerial</Text>
              </View>
            )}
            <Text className={`text-[10px] font-bold ${person.is_active ? "" : "text-red-500"}`} numberOfLines={1}>
              {person.is_active ? "• Activo" : "Inactivo"}
            </Text>
          </View>
        </View>

        <View ref={buttonRef}>
          <TouchableOpacity
            onPress={handleOpenMenu}
            className="w-9 h-9 items-center justify-center rounded-full bg-surface-input-light dark:bg-surface-input-dark active:bg-slate-100 dark:active:bg-slate-700"
            activeOpacity={0.6}
          >
            <MaterialIcons name="more-vert" size={22} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </>
  );
};

export default PersonCard;
