import { router } from "expo-router";
import { Button, Text, View } from "react-native";

import { useSession } from "@/components/ctx";

export default function SignOut() {
  const { signOut } = useSession();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>¿Desea cerrar sesión?</Text>

      <Button
        title="Cerrar sesión"
        onPress={() => {
          signOut();
          // Navigate after signing in. You may want to tweak this to ensure sign-in is
          // successful before navigating.
          router.replace("/auth/sign-in");
        }}
      />
    </View>
  );
}
