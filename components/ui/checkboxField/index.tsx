import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface CheckboxFieldProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({ label, value, onChange, disabled }) => {
  return (
    <TouchableOpacity
      onPress={() => onChange(!value)}
      activeOpacity={0.7}
      disabled={disabled}
      className="flex flex-row items-center justify-between p-3.5 rounded-xl bg-card-light dark:bg-card-dark border border-border-input-light dark:border-border-input-dark shadow-sm active:scale-[0.99] transition-transform"
    >
      <Text className="text-text-main-light dark:text-text-main-dark font-medium ml-1">{label}</Text>
      <View
        className={`h-6 w-6 rounded-lg border-2 items-center justify-center ${
          value
            ? "bg-primary border-primary"
            : "bg-surface-input-light dark:bg-surface-input-dark border-border-input-light dark:border-border-input-dark"
        }`}
      >
        {value && <MaterialIcons name="check" size={16} color="white" />}
      </View>
    </TouchableOpacity>
  );
};

export default CheckboxField;
