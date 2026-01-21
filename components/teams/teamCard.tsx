import { Team } from "@/types/team.types";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface TeamCardProps {
  team: Team;
  onPress?: () => void;
}

const bgColors = [
  "bg-blue-100",
  "bg-indigo-100",
  "bg-emerald-100",
  "bg-orange-100",
  "bg-rose-100",
  "bg-fuchsia-100",
  "bg-cyan-100",
  "bg-amber-100",
  "bg-slate-100",
];
const iconColors = ["#2563eb", "#4f46e5", "#059669", "#ea580c", "#e11d48", "#c026d3", "#0891b2", "#d97706", "#64748b"];

/**
 * TeamCard component for displaying team information.
 * Follows the design provided in the HTML snippet.
 */
const TeamCard: React.FC<TeamCardProps> = ({ team, onPress }) => {
  const getIconConfig = () => {
    const index = team.id % bgColors.length;
    return {
      icon: "group",
      bgColor: bgColors[index],
      iconColor: iconColors[index],
    };
  };

  const { icon, bgColor, iconColor } = getIconConfig();
  const subText = `${team.total_people} miembros • ${team.total_active_people} activos`;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      // className="flex-row items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)] active:scale-[0.98] active:bg-slate-50"
      className="flex flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200"
      style={{
        boxShadow: "0px 2px 10px rgba(15, 23, 42, 0.05)",
        elevation: 2,
      }}
    >
      {/* Team Icon */}
      <View className={`w-12 h-12 rounded-full items-center justify-center ${bgColor}`}>
        <MaterialIcons name={icon as any} size={24} color={iconColor} />
      </View>

      {/* Team Info */}
      <View className="flex-1 min-w-0">
        <Text className="text-[17px] font-semibold text-slate-900" numberOfLines={1}>
          {team.name}
        </Text>
        <Text className="text-[14px] text-slate-500 mt-0.5" numberOfLines={1}>
          {subText}
        </Text>
      </View>

      {/* Right Arrow */}
      <View className="items-center justify-center">
        <MaterialIcons name="chevron-right" size={24} color="#cbd5e1" />
      </View>
    </TouchableOpacity>
  );
};

export default TeamCard;
