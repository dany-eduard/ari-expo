import { api } from "@/services/api";

export const rolesService = {
  async getRoles() {
    return api.get(`/roles`);
  },
};
