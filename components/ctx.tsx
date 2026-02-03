import { useStorageState } from "@/hooks/useStorageState";
import { authService } from "@/services/auth.service";
import { LoginFormData } from "@/types/auth.types";
import { createContext, useCallback, useContext, useMemo, type PropsWithChildren } from "react";

const AuthContext = createContext<{
  signIn: (data: LoginFormData) => Promise<void>;
  signOut: () => void;
  session?: string | null;
  user?: any | null;
  isLoading: boolean;
}>({
  signIn: async () => {},
  signOut: () => null,
  session: null,
  user: null,
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
  const [[, user], setUser] = useStorageState("user");

  const signIn = useCallback(
    async (data: LoginFormData) => {
      try {
        const response = await authService.login(data);
        if (!response.access_token) throw new Error(response.message || "No se pudo iniciar sesión");
        setSession(response.access_token);
        setUser(JSON.stringify(response.user));
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    },
    [setSession, setUser],
  );

  const signOut = useCallback(() => {
    setSession(null);
    setUser(null);
  }, [setSession, setUser]);

  const contextValue = useMemo(
    () => ({
      signIn,
      signOut,
      session,
      user: JSON.parse(user || "{}"),
      isLoading,
    }),
    [signIn, signOut, session, user, isLoading],
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
}
