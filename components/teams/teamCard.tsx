import { useColorScheme } from "@/hooks/use-color-scheme";
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
  "bg-rose-100 dark:bg-rose-900/30",
  "bg-fuchsia-100 dark:bg-fuchsia-900/30",
  "bg-cyan-100 dark:bg-cyan-900/30",
  "bg-amber-100 dark:bg-amber-900/30",
  "bg-slate-100 dark:bg-slate-800",
];
const iconColors = ["#2563eb", "#4f46e5", "#059669", "#ea580c", "#e11d48", "#c026d3", "#0891b2", "#d97706", "#64748b"];
const darkIconColors = ["#60a5fa", "#818cf8", "#34d399", "#fb923c", "#fb7185", "#e879f9", "#22d3ee", "#fbbf24", "#94a3b8"];

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
  const colorScheme = useColorScheme();
  const actualIconColor = colorScheme === "dark" ? darkIconColors[team.id % darkIconColors.length] : iconColor;
  const subText = `${team.total_people} miembros • ${team.total_active_people} activos`;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex flex-row items-center gap-4 bg-card-light dark:bg-card-dark p-4 rounded-2xl border border-border-input-light dark:border-border-input-dark"
      style={{
        boxShadow: "0px 2px 10px rgba(15, 23, 42, 0.05)",
        elevation: 2,
      }}
    >
      {/* Team Icon */}
      <View className={`w-12 h-12 rounded-full items-center justify-center ${bgColor}`}>
        <MaterialIcons name={icon as any} size={24} color={actualIconColor} />
      </View>

      {/* Team Info */}
      <View className="flex-1 min-w-0">
        <Text className="text-[17px] font-semibold text-text-main-light dark:text-text-main-dark" numberOfLines={1}>
          {team.name}
        </Text>
        <Text className="text-[14px] text-text-secondary-light dark:text-text-secondary-dark mt-0.5" numberOfLines={1}>
          {subText}
        </Text>
      </View>

      {/* Right Arrow */}
      <View className="items-center justify-center">
        <MaterialIcons name="chevron-right" size={24} color="#cbd5e1" className="dark:text-slate-600" />
      </View>
    </TouchableOpacity>
  );
};

export default TeamCard;
