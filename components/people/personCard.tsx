import { Person } from "@/types/person.types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link, usePathname } from "expo-router";
import React, { useState } from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";

interface PersonCardProps {
  person: Person;
  onPress?: () => void;
}

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
}: {
  person: Person;
  visible: boolean;
  onClose: () => void;
  position: { top: number; right: number };
}) => {
  const pathname = usePathname();

  const itsOnTeamsScreen = pathname.includes("teams");
  const itsOnPeopleScreen = pathname.includes("people");

  return (
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
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 5,
            borderWidth: 1,
            borderColor: "#f1f5f9",
          }}
        >
          {itsOnPeopleScreen && (
            <Link href={`/people/${person.id}/reports/record`} asChild>
              <TouchableOpacity className="p-3 flex-row items-center gap-3 active:bg-slate-50 rounded-b-lg" onPress={onClose}>
                <MaterialIcons name="history" size={20} color="#64748b" />
                <Text className="text-slate-700 font-medium text-sm">Ver registro</Text>
              </TouchableOpacity>
            </Link>
          )}
          {itsOnTeamsScreen && (
            <Link href={`/people/${person.id}/reports/new`} asChild>
              <TouchableOpacity className="p-3 flex-row items-center gap-3 active:bg-slate-50 rounded-b-lg" onPress={onClose}>
                <MaterialIcons name="post-add" size={20} color="#64748b" />
                <Text className="text-slate-700 font-medium text-sm">Agregar registro</Text>
              </TouchableOpacity>
            </Link>
          )}
          <Link href={`/people/${person.id}?view=true`} asChild>
            <TouchableOpacity
              className="p-3 border-b border-gray-50 flex-row items-center gap-3 active:bg-slate-50 rounded-t-lg"
              onPress={onClose}
            >
              <MaterialIcons name="visibility" size={20} color="#64748b" />
              <Text className="text-slate-700 font-medium text-sm">Ver detalles</Text>
            </TouchableOpacity>
          </Link>
          <Link href={`/people/${person.id}?edit=true`} asChild>
            <TouchableOpacity className="p-3 flex-row items-center gap-3 active:bg-slate-50 rounded-b-lg" onPress={onClose}>
              <MaterialIcons name="edit" size={20} color="#64748b" />
              <Text className="text-slate-700 font-medium text-sm">Editar</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </Pressable>
    </Modal>
  );
};

const PersonCard: React.FC<PersonCardProps> = ({ person, onPress }) => {
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
      <MenuOptions person={person} visible={menuVisible} onClose={() => setMenuVisible(false)} position={menuPosition} />
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        className="flex flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200"
        style={{
          shadowColor: "#0f172a",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 2,
        }}
      >
        <View className="relative">
          <View
            className={`flex items-center justify-center h-14 w-14 rounded-full border-2 border-white ${person.sex === "MALE" ? "bg-blue-400" : "bg-pink-400"}`}
          >
            <Text className="text-white font-bold text-lg">
              {person.first_name?.charAt(0).toUpperCase() + person.last_name?.charAt(0).toUpperCase()}
            </Text>
          </View>

          {/* {person.status === "online" && (
          <View className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-primary border-[3px] border-white" />
        )} */}
        </View>

        <View className="flex-1 flex-col justify-center">
          <View className="flex flex-row justify-between items-center mb-1">
            <Text className="text-text-main text-base font-bold flex-1 mr-2" numberOfLines={1}>
              {person.first_name.trim() + " " + person.last_name.trim()}
            </Text>
            {/* <View
            className={`px-2 py-0.5 rounded-lg border ${
              person.hours !== "0h" ? "bg-primary/5 border-primary/20" : "bg-slate-50 border-slate-200"
            }`}
            >
              <Text className={`text-[11px] font-bold ${person.hours !== "0h" ? "text-primary" : "text-slate-400"}`}>{person.hours}</Text>
            </View> */}
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
            className="w-9 h-9 items-center justify-center rounded-full bg-slate-50 active:bg-slate-100"
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
