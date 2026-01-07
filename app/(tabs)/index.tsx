import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { Platform, StyleSheet, Text, View } from "react-native";

import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedCard } from "@/components/themed-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={<Image source={require("@/assets/images/partial-react-logo.png")} style={styles.reactLogo} />}
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">¡Bienvenido!</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes. Press{" "}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: "cmd + d",
              android: "cmd + m",
              web: "F12",
            })}
          </ThemedText>{" "}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert("Action pressed")} />
            <Link.MenuAction title="Share" icon="square.and.arrow.up" onPress={() => alert("Share pressed")} />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction title="Delete" icon="trash" destructive onPress={() => alert("Delete pressed")} />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>{`Tap the Explore tab to learn more about what's included in this starter app.`}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Acciones rápidas</ThemedText>
        <ThemedText>
          {`When you're ready, run `}
          <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{" "}
          <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{" "}
          <ThemedText type="defaultSemiBold">app</ThemedText> to <ThemedText type="defaultSemiBold">app-example</ThemedText>.
        </ThemedText>
        <View className="flex flex-col p-4 bg-blue-500 rounded-xl">
          <Text>Hola esta es una prueba</Text>
          <Text>Hola esta es una prueba</Text>
          <Text>Hola esta es una prueba</Text>
          <Text>Hola esta es una prueba</Text>
        </View>
        <View className="flex-1 items-center justify-center bg-white">
          <Text className="text-xl font-bold text-blue-500">Welcome to Nativewind!</Text>
        </View>
        <ThemedView style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
          <ThemedCard style={{ flex: 1, minWidth: "40%" }}>
            <ThemedText>Registrar informe</ThemedText>
          </ThemedCard>
          <ThemedCard style={{ flex: 1, minWidth: "40%" }}>
            <ThemedText>Nueva persona</ThemedText>
          </ThemedCard>
          <ThemedCard style={{ flex: 1, minWidth: "40%" }}>
            <ThemedText>Estadisticas por grupos</ThemedText>
          </ThemedCard>
          <ThemedCard style={{ flex: 1, minWidth: "40%" }}>
            {/* TODO: Pantalla de configuración: CRUD de congregaciones, cerrar sesión, etc */}
            <ThemedText onPress={() => router.replace("/auth/sign-out")}>Configuración</ThemedText>
          </ThemedCard>
        </ThemedView>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
