import { api } from "@/services/api";
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
  async login(data: LoginFormData): Promise<AuthResponse & { message?: string }> {
    return api.post("/auth/login", {
      email: data.email,
      password: data.password,
      congregation_id: +data.congregation,
    });
  },
};
