import React, { useCallback, useEffect, useState } from "react";
import { AlertButton as RNAlertButton } from "react-native";
import { AlertButton, AlertDialog } from "../ui/AlertDialog";

interface AlertState {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

// Global ref to access alert from non-hook usage
export let alertRef: {
  current: ((title: string, message?: string, buttons?: RNAlertButton[]) => void) | null;
} = { current: null };

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AlertState>({
    visible: false,
    title: "",
    message: "",
    buttons: [],
  });

  const showAlert = useCallback((title: string, message?: string, buttons?: RNAlertButton[]) => {
    setState({
      visible: true,
      title,
      message,
      buttons: buttons as AlertButton[],
    });
  }, []);

  const hideAlert = useCallback(() => {
    setState((prev) => ({ ...prev, visible: false }));
  }, []);

  // Expose showAlert globally via ref
  useEffect(() => {
    alertRef.current = showAlert;
    return () => {
      alertRef.current = null;
    };
  }, [showAlert]);

  return (
    <>
      {children}
      <AlertDialog visible={state.visible} title={state.title} message={state.message} buttons={state.buttons} onDismiss={hideAlert} />
    </>
  );
};
