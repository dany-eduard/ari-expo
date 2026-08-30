import { Stack } from "expo-router";

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="monthly-summary"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="regular-pioneers-activity"
        options={{
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
