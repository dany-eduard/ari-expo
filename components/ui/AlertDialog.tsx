import React, { useEffect, useRef } from "react";
import { Animated, Modal, Platform, Pressable, Text, TouchableOpacity, View } from "react-native";

export interface AlertButton {
  text?: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

interface AlertDialogProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onDismiss: () => void;
}

export const AlertDialog: React.FC<AlertDialogProps> = ({ visible, title, message, buttons = [], onDismiss }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset values to start state before animating in
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);

      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: Platform.OS !== "web",
          tension: 60,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: Platform.OS !== "web",
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: Platform.OS !== "web",
        }),
      ]).start();
    }
  }, [visible]);

  // Default button if none provided
  const displayButtons = buttons.length > 0 ? buttons : [{ text: "OK", style: "default", onPress: onDismiss }];

  return (
    <Modal transparent visible={visible} animationType="none" onRequestClose={onDismiss} statusBarTranslucent>
      <View
        className="absolute inset-0 items-center justify-center px-4"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", width: "100%", height: "100%" }}
      >
        <Pressable className="absolute inset-0" onPress={onDismiss} />

        <Animated.View
          className="w-full max-w-sm rounded-2xl overflow-hidden"
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 10,
            backgroundColor: "white",
          }}
        >
          <View className="p-6 items-center">
            {/* Optional Icon based on context could be added here */}
            {/* <MaterialIcons name="info-outline" size={48} color="#3b82f6" className="mb-4" /> */}

            <Text className="text-xl font-bold text-slate-900 text-center mb-2">{title}</Text>
            {message && <Text className="text-base text-slate-500 text-center leading-6">{message}</Text>}
          </View>

          <View className={`flex-row border-t border-slate-100 ${displayButtons.length > 2 ? "flex-col" : ""}`}>
            {displayButtons.map((btn, index) => {
              const isDestructive = btn.style === "destructive";
              const isCancel = btn.style === "cancel";

              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.7}
                  onPress={() => {
                    if (btn.onPress) btn.onPress();
                    onDismiss();
                  }}
                  className={`flex-1 p-4 items-center justify-center border-l border-slate-100 first:border-l-0 active:bg-slate-50 ${displayButtons.length > 2 ? "border-l-0 border-b last:border-b-0" : ""}`}
                >
                  <Text
                    className={`text-base font-semibold ${isDestructive ? "text-red-500" : isCancel ? "text-slate-500" : "text-blue-600"}`}
                  >
                    {btn.text || "OK"}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};
