import { StyleSheet, View, type ViewProps } from "react-native";

import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedCardProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedCard({ style, lightColor, darkColor, ...otherProps }: ThemedCardProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, "card");

  return <View style={[{ backgroundColor }, styles.card, style]} {...otherProps} />;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 3,
  },
});
