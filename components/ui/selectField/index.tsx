import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useRef, useState } from "react";
import { Animated, FlatList, Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { SelectFieldProps } from "./types";

/**
 * A reusable select field component for React Native (Android, iOS, Web).
 * Uses a Modal to display options consistently across platforms.
 */
const SelectField: React.FC<SelectFieldProps> = ({ label, value, placeholder, onChange, options, disabled }) => {
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

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View className="flex flex-col gap-2">
      <Text className="text-text-main-light dark:text-text-main-dark text-sm font-medium ml-1">{label}</Text>

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
        disabled={disabled}
        className="w-full rounded-xl border border-border-input-light dark:border-border-input-dark bg-surface-input-light dark:bg-surface-input-dark h-14 pl-4 pr-4 flex-row items-center justify-between"
      >
        <Text
          className={`text-base ${selectedOption ? "text-text-main-light dark:text-text-main-dark" : "text-text-secondary-light/50 dark:text-text-secondary-dark/50"}`}
        >
          {selectedOption ? selectedOption.label : placeholder || "Selecciona una opción"}
        </Text>
        <MaterialIcons name="expand-more" size={24} color="#9BA1A6" className="dark:text-slate-400" />
      </TouchableOpacity>

      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={handleClose}>
        <View className="flex-1 bg-black/40">
          <Pressable className="flex-1" onPress={handleClose} />
          <Animated.View
            style={{
              transform: [{ translateY: slideAnim }],
            }}
            className="w-full rounded-t-3xl overflow-hidden pb-8 bg-background-light dark:bg-background-dark"
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
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onChange(item.value);
                    handleClose();
                  }}
                  className={`p-5 flex-row items-center justify-between ${item.value === value ? "bg-primary/5 dark:bg-primary/10" : ""}`}
                >
                  <Text
                    className={`text-base ${item.value === value ? "text-primary font-bold" : "text-text-main-light dark:text-text-main-dark"}`}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && <MaterialIcons name="check-circle" size={24} color="#2563eb" />}
                </TouchableOpacity>
              )}
            />

            <View className="px-5 mb-4 bg-background-light dark:bg-background-dark">
              <TouchableOpacity
                onPress={handleClose}
                className="items-center justify-center h-14 rounded-xl bg-surface-input-light dark:bg-surface-input-dark"
              >
                <Text className="text-text-main-light dark:text-text-main-dark font-bold">Cancelar</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default SelectField;
