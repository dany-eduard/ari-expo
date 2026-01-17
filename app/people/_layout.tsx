import { Stack } from "expo-router";

export default function PeopleLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="new"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          animation: "slide_from_bottom",
          presentation: "card",
        }}
      />
      <Stack.Screen
        name="[id]/reports/new"
        options={{
          animation: "slide_from_bottom",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="[id]/reports/record"
        options={{
          animation: "slide_from_left",
          presentation: "modal",
        }}
      />
    </Stack>
  );
}
