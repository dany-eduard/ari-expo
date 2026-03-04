import { View, Animated, StyleSheet, DimensionValue } from "react-native";
import React, { useEffect, useRef } from "react";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  borderRadius?: number;
}

export function Skeleton({ width = "100%", height = 16, borderRadius = 8 }: SkeletonProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const translateX = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: 400,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [translateX]);

  const backgroundColor = isDark ? "#334155" : "#e2e8f0";
  const shimmerColor = isDark ? "#475569" : "#f1f5f9";

  return (
    <View style={{ width, height, borderRadius, backgroundColor, overflow: "hidden" }}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: shimmerColor,
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
}

export function SkeletonCircle({ size = 40 }: { size?: number }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const translateX = useRef(new Animated.Value(-size)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.timing(translateX, {
        toValue: size * 2,
        duration: 1500,
        useNativeDriver: true,
      })
    );
    animation.start();
    return () => animation.stop();
  }, [translateX, size]);

  const backgroundColor = isDark ? "#334155" : "#e2e8f0";
  const shimmerColor = isDark ? "#475569" : "#f1f5f9";

  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor, overflow: "hidden" }}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: shimmerColor,
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
}
