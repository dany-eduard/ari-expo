import * as Updates from "expo-updates";
import { useEffect } from "react";
import { Alert, Platform } from "react-native";
import { APP_VERSION } from "../constants/config";

export function useUpdateAlert() {
  const checkWebUpdate = async () => {
    const storedVersion = localStorage.getItem("app_version");
    if (storedVersion && storedVersion !== APP_VERSION) {
      const reload = confirm("Hay una nueva versión disponible. ¿Deseas actualizar?");
      if (reload) {
        localStorage.setItem("app_version", APP_VERSION);
        window.location.reload();
      }
    } else {
      localStorage.setItem("app_version", APP_VERSION);
    }
  };

  const checkAndroidUpdate = async () => {
    const update = await Updates.checkForUpdateAsync();
    if (update.isAvailable) {
      Alert.alert("Actualización disponible", "Hay una nueva versión de la app. ¿Deseas actualizar ahora?", [
        { text: "Más tarde", style: "cancel" },
        {
          text: "Actualizar",
          onPress: async () => {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
          },
        },
      ]);
    }
  };

  const checkUpdate = async () => {
    try {
      if (Platform.OS === "web") {
        checkWebUpdate();
      } else {
        checkAndroidUpdate();
      }
    } catch (error) {
      console.error("Error buscando actualización", error);
    }
  };

  useEffect(() => {
    checkUpdate();
  }, []);
}
