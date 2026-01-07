import { Alert, AlertButton, Platform } from "react-native";

export function ShowAlert(title: string, message?: string, buttons?: AlertButton[]) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message, buttons);
  }
}
