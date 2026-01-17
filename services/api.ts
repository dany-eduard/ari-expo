import { ShowAlert } from "@/components/alert";
import { API_URL } from "@/constants/config";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { decodeJwt } from "jose";
import { Platform } from "react-native";
import { navigationState } from "./navigation.state";

function redirect() {
  console.log("redirect");
  router.push("/auth/sign-in");
}

async function validateToken(token: string) {
  if (!token) return false;

  try {
    const payload = decodeJwt(token);
    console.log("Datos del usuario:", payload);
    console.log("Expira en:", new Date(payload.exp! * 1000).toLocaleString());

    if (payload.exp && payload.exp < Date.now() / 1000) {
      ShowAlert("Sesión expirada", "Por favor, inicia sesión de nuevo.");
      removeToken();
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error al validar el token:", error);
    removeToken();
    return false;
  }
}

async function getToken() {
  if (Platform.OS === "web") {
    try {
      if (typeof localStorage !== "undefined") {
        return localStorage.getItem("session");
      }
    } catch (e) {
      console.error("Local storage is unavailable:", e);
    }
  } else {
    try {
      return await SecureStore.getItemAsync("session");
    } catch (e) {
      console.error("SecureStore is unavailable:", e);
    }
  }
  return null;
}

async function removeToken() {
  if (Platform.OS === "web") {
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.removeItem("session");
      }
    } catch (e) {
      console.error("Local storage is unavailable:", e);
    }
  } else {
    try {
      return await SecureStore.deleteItemAsync("session");
    } catch (e) {
      console.error("SecureStore is unavailable:", e);
    }
  }
}

export { API_URL, getToken };

export const api = {
  async request(endpoint: string, options: RequestInit & { rawResponse?: boolean } = {}) {
    // Normalize endpoint to ensuring it starts with /
    const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

    const currentPath = Platform.OS === "web" ? window.location.pathname : navigationState.getPath();
    const toExclude =
      ["/auth/login", "/auth/sign-in"].includes(normalizedEndpoint) ||
      ["/auth/sign-in", "/auth/sign-up"].some((path) => currentPath.includes(path));

    const token = await getToken();

    // The header construction was missing/broken in previous edit, restoring it
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (!toExclude) {
      if (token) {
        const isValid = await validateToken(token);
        if (isValid) {
          headers["Authorization"] = `Bearer ${token}`;
        } else {
          return redirect();
        }
      } else {
        return redirect();
      }
    }

    const response = await fetch(`${API_URL}${normalizedEndpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    if (options.rawResponse) {
      return response;
    }

    // Some endpoints might return empty response for 204 No Content
    if (response.status === 204) {
      return null;
    }

    return response.json();
  },

  get(endpoint: string, options: RequestInit = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  },

  getRaw(endpoint: string, options: RequestInit = {}) {
    return this.request(endpoint, { ...options, method: "GET", rawResponse: true });
  },

  post(endpoint: string, body?: any, options: RequestInit = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  put(endpoint: string, body?: any, options: RequestInit = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  patch(endpoint: string, body?: any, options: RequestInit = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete(endpoint: string, options: RequestInit = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  },
};
