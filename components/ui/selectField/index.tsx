import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useState } from "react";
import { FlatList, Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { SelectFieldProps } from "./types";

/**
 * A reusable select field component for React Native (Android, iOS, Web).
 * Uses a Modal to display options consistently across platforms.
 */
const SelectField: React.FC<SelectFieldProps> = ({ label, value, placeholder, onChange, options }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View className="flex flex-col gap-2">
      <Text className="text-text-main text-sm font-medium ml-1">{label}</Text>

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
        className="w-full rounded-xl border border-border-input bg-surface-input h-14 pl-4 pr-4 flex-row items-center justify-between"
      >
        <Text className={`text-base ${selectedOption ? "text-text-main" : "text-text-secondary/50"}`}>
          {selectedOption ? selectedOption.label : placeholder || "Selecciona una opción"}
        </Text>
        <MaterialIcons name="expand-more" size={24} color="#9BA1A6" />
      </TouchableOpacity>

      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <Pressable className="flex-1 justify-end bg-black/40" onPress={() => setModalVisible(false)}>
          <View className="w-full bg-white rounded-t-3xl overflow-hidden pb-8">
            <View className="p-5 border-b border-slate-100 flex-row items-center justify-between">
              <Text className="text-text-main text-lg font-bold">{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onChange(item.value);
                    setModalVisible(false);
                  }}
                  className={`p-5 flex-row items-center justify-between ${item.value === value ? "bg-primary/5" : ""}`}
                >
                  <Text className={`text-base ${item.value === value ? "text-primary font-bold" : "text-text-main"}`}>{item.label}</Text>
                  {item.value === value && <MaterialIcons name="check-circle" size={24} color="#2563eb" />}
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              className="mx-5 mb-4 items-center justify-center h-14 rounded-xl bg-slate-100"
            >
              <Text className="text-text-main font-bold">Cancelar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

export default SelectField;
