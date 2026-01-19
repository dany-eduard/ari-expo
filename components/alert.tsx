import { AlertButton, Alert as NativeAlert } from "react-native";
import { alertRef } from "./providers/AlertProvider";

export function ShowAlert(title: string, message?: string, buttons?: AlertButton[]) {
  if (alertRef.current) {
    alertRef.current(title, message, buttons);
  } else {
    // Fallback to native alert if provider not mounted
    NativeAlert.alert(title, message, buttons);
  }
}
