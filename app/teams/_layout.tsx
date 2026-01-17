import { Stack } from "expo-router";

export default function TeamsLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerShadowVisible: false,
        headerTintColor: "#0f172a", // Blue 600
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          headerTitle: "Detalle del grupo",
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="edit/[id]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
