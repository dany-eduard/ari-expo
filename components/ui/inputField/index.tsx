import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { InputFieldProps } from "./types";

/**
 * A reusable input field component for React Native (Android, iOS, Web).
 * Uses NativeWind for styling.
 */
const InputField: React.FC<InputFieldProps> = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  icon,
  iconPosition = "right",
  showToggle,
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Basic mapping for keyboardType
  const getKeyboardType = () => {
    switch (type) {
      case "email":
        return "email-address";
      case "number":
        return "numeric";
      default:
        return "default";
    }
  };

  const hasLeftIcon = icon && iconPosition === "left";
  const hasRightIcon = (icon && iconPosition === "right") || showToggle;

  return (
    <View className="flex flex-col gap-2">
      <Text className="text-text-main text-sm font-medium ml-1">{label}</Text>
      <View className="relative w-full">
        {hasLeftIcon && (
          <View className="absolute left-4 top-0 h-full justify-center z-10 pointer-events-none">
            <MaterialIcons name={icon as any} size={20} color="#9BA1A6" />
          </View>
        )}

        <TextInput
          className={`w-full rounded-xl border border-border-input bg-surface-input h-14 ${
            hasLeftIcon ? "pl-12" : "pl-4"
          } ${hasRightIcon ? "pr-12" : "pr-4"} text-base text-text-main focus:border-primary transition-all shadow-sm`}
          placeholder={placeholder}
          placeholderTextColor="#64748b80"
          value={value}
          onChangeText={onChange}
          secureTextEntry={showToggle ? !isVisible : type === "password"}
          keyboardType={getKeyboardType()}
          autoCapitalize="none"
          cursorColor="#2563eb"
          editable={!disabled}
        />

        {icon && iconPosition === "right" && !showToggle && (
          <View className="absolute right-4 top-0 h-full justify-center z-10 pointer-events-none">
            <MaterialIcons name={icon as any} size={20} color="#9BA1A6" />
          </View>
        )}

        {showToggle && (
          <TouchableOpacity
            onPress={() => setIsVisible(!isVisible)}
            className="absolute right-0 top-0 h-full w-12 flex items-center justify-center"
            activeOpacity={0.7}
          >
            <MaterialIcons name={isVisible ? "visibility-off" : "visibility"} size={20} color="#9BA1A6" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default InputField;
