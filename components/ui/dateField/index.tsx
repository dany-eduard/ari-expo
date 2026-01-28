import { dateToISOString, formatUTCToLocaleString, getUTCDateObject } from "@/utils/date.utils";
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
  const {
    day: initialDay,
    month: initialMonth, // 0-indexed
    year: initialYear,
  } = value ? getUTCDateObject(value) : { day: new Date().getDate(), month: new Date().getMonth(), year: new Date().getFullYear() };

  const [tempDay, setTempDay] = useState(initialDay);
  const [tempMonth, setTempMonth] = useState(initialMonth);
  const [tempYear, setTempYear] = useState(initialYear);

  // Sync state when value changes
  useEffect(() => {
    if (value) {
      const { day, month, year } = getUTCDateObject(value);
      setTempDay(day);
      setTempMonth(month);
      setTempYear(year);
    }
  }, [value]);

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

    const formattedDate = dateToISOString(tempYear, tempMonth, finalDay);
    onChange(formattedDate);
    setModalVisible(false);
  };

  const displayDate = value ? formatUTCToLocaleString(value) : placeholder || "Seleccionar fecha";

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
            className={`flex-1 text-base ${value ? "text-text-main-light dark:text-text-main-dark" : "text-text-secondary-light/50 dark:text-text-secondary-dark/50"}`}
          >
            {displayDate}
          </Text>
        </TouchableOpacity>

        <View className="absolute right-4 top-0 h-full justify-center z-10 pointer-events-none">
          <MaterialIcons name={(icon as any) || "calendar-today"} size={20} color="#9BA1A6" className="dark:text-slate-400" />
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

            <View className="flex-row h-72 bg-background-light dark:bg-background-dark">
              {/* Day column */}
              <View className="flex-1 border-r border-border-input-light dark:border-border-input-dark">
                <Text className="text-center text-xs font-bold text-slate-400 py-2">Día</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {days.map((d) => (
                    <TouchableOpacity
                      key={d}
                      onPress={() => setTempDay(d)}
                      className={`py-3 items-center ${tempDay === d ? "bg-primary/10" : ""}`}
                    >
                      <Text
                        className={`text-lg ${tempDay === d ? "text-primary font-bold" : "text-text-main-light dark:text-text-main-dark"}`}
                      >
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Month column */}
              <View className="flex-[2] border-r border-border-input-light dark:border-border-input-dark">
                <Text className="text-center text-xs font-bold text-slate-400 py-2">Mes</Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  {months.map((m, index) => (
                    <TouchableOpacity
                      key={m}
                      onPress={() => setTempMonth(index)}
                      className={`py-3 items-center ${tempMonth === index ? "bg-primary/10" : ""}`}
                    >
                      <Text
                        className={`text-lg ${tempMonth === index ? "text-primary font-bold" : "text-text-main-light dark:text-text-main-dark"}`}
                      >
                        {m}
                      </Text>
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
                      <Text
                        className={`text-lg ${tempYear === y ? "text-primary font-bold" : "text-text-main-light dark:text-text-main-dark"}`}
                      >
                        {y}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View className="p-6 flex-col gap-3 bg-background-light dark:bg-background-dark">
              <TouchableOpacity
                onPress={handleConfirm}
                className="items-center justify-center h-14 rounded-xl bg-primary shadow-sm"
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold text-base">Confirmar</Text>
              </TouchableOpacity>
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

export default DateField;
