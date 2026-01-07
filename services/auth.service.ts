import { API_URL } from "@/constants/config";
import { LoginFormData } from "@/types/auth.types";

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    congregation_id: number;
  };
}

export const authService = {
  async login(data: LoginFormData): Promise<AuthResponse> {
    if (!API_URL) {
      throw new Error("EXPO_PUBLIC_API_URL is not defined");
    }

    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
        congregation_id: +data.congregation, // Map congregation to congregation_id as requested
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch((error) => console.error("Error al iniciar sesión", error));
      throw new Error(errorData.message || "Error al iniciar sesión");
    }

    return response.json();
  },
};
