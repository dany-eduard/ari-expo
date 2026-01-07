import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";

import { SessionProvider, useSession } from "@/components/ctx";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { session, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inSignIn = segments[1] === "sign-in";
    const inSignUp = segments[1] === "sign-up";

    if (!session && !inSignIn && !inSignUp) {
      // Redirect to the sign-in page.
      router.replace("/auth/sign-in");
    } else if (session && inSignIn) {
      // Redirect away from the sign-in page.
      router.replace("/");
    }
  }, [session, isLoading, segments, router]);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth/sign-in" options={{ headerShown: false, animation: "fade", animationDuration: 200 }} />
        <Stack.Screen name="auth/sign-out" options={{ headerShown: false }} />
        <Stack.Screen name="auth/sign-up" options={{ headerShown: false, animation: "fade", animationDuration: 200 }} />
        <Stack.Screen name="modal" options={{ presentation: "modal", title: "Modal" }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SessionProvider>
      <RootLayoutNav />
    </SessionProvider>
  );
}
