import { navigationState } from "@/services/navigation.state";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack, usePathname, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import "../global.css";

import { SessionProvider, useSession } from "@/components/ctx";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useUpdateAlert } from "@/hooks/useUpdateAlert";

export const unstable_settings = {
  anchor: "(tabs)",
};

function RootLayoutNav() {
  useUpdateAlert();

  const colorScheme = useColorScheme();
  const { session, isLoading } = useSession();
  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname();
  // Update state synchronously during render so it's available to child components' effects immediately.
  // Parent useEffects run AFTER child useEffects, which caused the stale state issue.
  navigationState.setPath(pathname);

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
        <Stack.Screen name="auth/sign-up" options={{ headerShown: false, animation: "fade", animationDuration: 200 }} />
        <Stack.Screen name="teams" options={{ headerShown: false }} />
        <Stack.Screen name="people" options={{ headerShown: false }} />
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
