import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Modal, Pressable, ScrollView, Text, TouchableOpacity, View } from "react-native";

interface DateFieldProps {
  label: string;
  value: string; // Format: YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: string;
  disabled?: boolean;
}

const months = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const DateField: React.FC<DateFieldProps> = ({ label, value, onChange, placeholder, icon, disabled }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(300)).current;

  // Trigger content animation when modal opens
  useEffect(() => {
    if (modalVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      slideAnim.setValue(300);
    }
  }, [modalVisible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  // Parse current value or use today's date
  const date = value ? new Date(value) : new Date();
  const [tempDay, setTempDay] = useState(date.getDate());
  const [tempMonth, setTempMonth] = useState(date.getMonth()); // 0-indexed
  const [tempYear, setTempYear] = useState(date.getFullYear());

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const range = [];
    for (let i = currentYear; i >= currentYear - 100; i--) {
      range.push(i);
    }
    return range;
  }, []);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const days = useMemo(() => {
    const totalDays = getDaysInMonth(tempMonth, tempYear);
    const range = [];
    for (let i = 1; i <= totalDays; i++) {
      range.push(i);
    }
    return range;
  }, [tempMonth, tempYear]);

  const handleConfirm = () => {
    // Ensure tempDay is still valid for the selected month/year
    const maxDays = getDaysInMonth(tempMonth, tempYear);
    const finalDay = Math.min(tempDay, maxDays);

    const formattedMonth = (tempMonth + 1).toString().padStart(2, "0");
    const formattedDay = finalDay.toString().padStart(2, "0");
    onChange(`${tempYear}-${formattedMonth}-${formattedDay}`);
    setModalVisible(false);
  };

  const displayDate = value ? `${tempDay} de ${months[tempMonth]}, ${tempYear}` : placeholder || "Seleccionar fecha";

  return (
    <View className="flex flex-col gap-2">
      <Text className="text-text-main text-sm font-medium ml-1">{label}</Text>

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
        disabled={disabled}
        className="w-full rounded-xl border border-border-input bg-surface-input h-14 pl-4 pr-12 flex-row items-center relative"
      >
        <Text className={`text-base ${value ? "text-text-main" : "text-text-secondary/50"}`}>{displayDate}</Text>
        <View className="absolute right-4 top-0 h-full justify-center">
          <MaterialIcons name={(icon as any) || "calendar-today"} size={20} color="#9BA1A6" />
        </View>
      </TouchableOpacity>

      <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={handleClose}>
        <View className="flex-1 bg-black/40">
          <Pressable className="flex-1" onPress={handleClose} />
          <Animated.View
            style={{
              transform: [{ translateY: slideAnim }],
              backgroundColor: "white",
            }}
            className="w-full rounded-t-3xl overflow-hidden pb-8"
          >
            <View className="p-5 border-b border-slate-100 flex-row items-center justify-between bg-white">
              <Text className="text-slate-900 text-lg font-bold">{label}</Text>
              <TouchableOpacity onPress={handleClose} className="p-1">
                <MaterialIcons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View className="flex-row h-72 bg-white">
              {/* Day column */}
              <View className="flex-1 border-r border-slate-50">
                <Text className="text-center text-xs font-bold text-slate-400 py-2">Día</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {days.map((d) => (
                    <TouchableOpacity
                      key={d}
                      onPress={() => setTempDay(d)}
                      className={`py-3 items-center ${tempDay === d ? "bg-primary/10" : ""}`}
                    >
                      <Text className={`text-lg ${tempDay === d ? "text-primary font-bold" : "text-slate-700"}`}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Month column */}
              <View className="flex-[2] border-r border-slate-50">
                <Text className="text-center text-xs font-bold text-slate-400 py-2">Mes</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {months.map((m, index) => (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setTempMonth(index)}
                      className={`py-3 items-center ${tempMonth === index ? "bg-primary/10" : ""}`}
                    >
                      <Text className={`text-lg ${tempMonth === index ? "text-primary font-bold" : "text-slate-700"}`}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Year column */}
              <View className="flex-1">
                <Text className="text-center text-xs font-bold text-slate-400 py-2">Año</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {years.map((y) => (
                    <TouchableOpacity
                      key={y}
                      onPress={() => setTempYear(y)}
                      className={`py-3 items-center ${tempYear === y ? "bg-primary/10" : ""}`}
                    >
                      <Text className={`text-lg ${tempYear === y ? "text-primary font-bold" : "text-slate-700"}`}>{y}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View className="px-5 my-4 bg-white">
              <TouchableOpacity
                onPress={handleConfirm}
                className="items-center justify-center h-14 rounded-xl bg-primary shadow-sm"
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold text-lg">Confirmar</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
};

export default DateField;
