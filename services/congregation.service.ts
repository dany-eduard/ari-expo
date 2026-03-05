import { api } from "@/services/api";

export const congregationService = {
  async getCongregations(params?: { page?: number; limit?: number; search?: string; includeCount?: boolean; includeDate?: boolean }) {
    let query = "";
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
      query = `?${searchParams.toString()}`;
    }
    return api.get(`/congregations${query}`);
  },

  async createCongregation(data: { name: string; code: string }) {
    return api.post("/congregations", data);
  },

  async updateCongregation(id: number, data: { name?: string; code?: string }) {
    return api.put(`/congregations/${id}`, data);
  },

  async deleteCongregation(id: number) {
    return api.delete(`/congregations/${id}`);
  },
};
