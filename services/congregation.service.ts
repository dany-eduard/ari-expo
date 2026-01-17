import { api } from "@/services/api";

export const congregationService = {
  async getCongregations() {
    return api.get("/congregations");
  },

  async createCongregation(data: any) {
    return api.post("/congregations", data);
  },
};
