import { API_URL } from "@/constants/config";

export const congregationService = {
  async getCongregations() {
    const response = await fetch(`${API_URL}/congregations`);
    return response.json();
  },

  async createCongregation(data: any) {
    const response = await fetch(`${API_URL}/congregations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
};
