import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useRef, useState } from "react";
import { Animated, FlatList, Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { SelectFieldProps } from "./types";

/**
 * A reusable select field component for React Native (Android, iOS, Web).
 * Uses a Modal to display options consistently across platforms.
 */
const SelectField: React.FC<SelectFieldProps> = ({ label, value, placeholder, onChange, options, disabled, multiple }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (modalVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      slideAnim.setValue(400);
    }
  }, [modalVisible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 400,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const isSelected = (val: string) => {
    if (multiple) {
      return Array.isArray(value) && value.includes(val);
    }
    return value === val;
  };

  const handleSelect = (val: string) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? [...value] : [];
      const index = currentValues.indexOf(val);
      if (index > -1) {
        currentValues.splice(index, 1);
      } else {
        currentValues.push(val);
      }
      onChange(currentValues);
    } else {
      onChange(val);
      handleClose();
    }
  };

  const getDisplayText = () => {
    if (multiple) {
      const selectedLabels = options.filter((opt) => (value as string[]).includes(opt.value)).map((opt) => opt.label);
      return selectedLabels.length > 0 ? selectedLabels.join("; ") : placeholder || "Selecciona opciones";
    }
    const selectedOption = options.find((opt) => opt.value === value);
    return selectedOption ? selectedOption.label : placeholder || "Selecciona una opción";
  };

  const hasSelection = multiple ? Array.isArray(value) && value.length > 0 : !!value;

  return (
    <View className="flex flex-col gap-2">
      <Text className="text-text-main-light dark:text-text-main-dark text-sm font-medium ml-1">{label}</Text>

      <View className="relative w-full">
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          activeOpacity={0.7}
          disabled={disabled}
          className="w-full rounded-xl border border-border-input-light dark:border-border-input-dark bg-surface-input-light dark:bg-surface-input-dark h-14 pl-4 pr-12 flex-row items-center shadow-sm overflow-hidden"
        >
          <Text
            numberOfLines={1}
            className={`flex-1 text-base ${hasSelection ? "text-text-main-light dark:text-text-main-dark" : "text-text-secondary-light/50 dark:text-text-secondary-dark/50"}`}
          >
            {getDisplayText()}
          </Text>
        </TouchableOpacity>

        <View className="absolute right-4 top-0 h-full justify-center z-10 pointer-events-none">
          <MaterialIcons name="expand-more" size={20} color="#9BA1A6" className="dark:text-slate-400" />
        </View>
      </View>

      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={handleClose}>
        <View className="flex-1 bg-black/40">
          <Pressable className="flex-1" onPress={handleClose} />
          <Animated.View
            style={{
              transform: [{ translateY: slideAnim }],
            }}
            className="w-full rounded-t-3xl overflow-hidden bg-background-light dark:bg-background-dark"
          >
            <View className="p-5 border-b border-border-input-light dark:border-border-input-dark flex-row items-center justify-between bg-background-light dark:bg-background-dark">
              <Text className="text-text-main-light dark:text-text-main-dark text-lg font-bold">{label}</Text>
              <TouchableOpacity onPress={handleClose} className="p-1">
                <MaterialIcons name="close" size={24} color="#64748b" className="dark:text-slate-400" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              className="bg-background-light dark:bg-background-dark"
              renderItem={({ item }) => {
                const selected = isSelected(item.value);
                return (
                  <TouchableOpacity
                    onPress={() => handleSelect(item.value)}
                    className={`p-5 flex-row items-center justify-between ${selected ? "bg-primary/5 dark:bg-primary/10" : ""}`}
                  >
                    <Text className={`text-base ${selected ? "text-primary font-bold" : "text-text-main-light dark:text-text-main-dark"}`}>
                      {item.label}
                    </Text>
                    {selected && <MaterialIcons name="check-circle" size={24} color="#2563eb" />}
                  </TouchableOpacity>
                );
              }}
            />

            <View className="p-6 bg-background-light dark:bg-background-dark gap-3">
              {multiple && (
                <TouchableOpacity
                  onPress={handleClose}
                  activeOpacity={0.8}
                  className="w-full items-center justify-center h-14 rounded-xl bg-primary"
                >
                  <Text className="text-white font-bold text-base">Confirmar</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleClose}
                activeOpacity={0.8}
                className="w-full items-center justify-center h-14 rounded-xl bg-surface-input-light dark:bg-surface-input-dark border border-border-input-light dark:border-border-input-dark"
              >
                <Text className="text-text-main-light dark:text-text-main-dark font-bold text-base">Cancelar</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default SelectField;
