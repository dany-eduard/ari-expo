import { useStorageState } from "@/hooks/useStorageState";
import { authService } from "@/services/auth.service";
import { LoginFormData } from "@/types/auth.types";
import { createContext, useContext, type PropsWithChildren } from "react";

const AuthContext = createContext<{
  signIn: (data: LoginFormData) => Promise<void>;
  signOut: () => void;
  session?: string | null;
  isLoading: boolean;
}>({
  signIn: async () => {},
  signOut: () => null,
  session: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== "production") {
    if (!value) {
      throw new Error("useSession must be wrapped in a <SessionProvider />");
    }
  }

  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState("session");

  return (
    <AuthContext.Provider
      value={{
        signIn: async (data: LoginFormData) => {
          try {
            const { access_token } = await authService.login(data);
            setSession(access_token);
          } catch (error) {
            console.error("Login failed:", error);
            throw error;
          }
        },
        signOut: () => {
          setSession(null);
        },
        session,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
