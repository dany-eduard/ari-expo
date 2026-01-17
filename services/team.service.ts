import { api } from "@/services/api";
import { Team } from "@/types/team.types";

export const teamService = {
  async createTeam(data: Team) {
    return api.post("/teams", data);
  },

  async getTeamsByCongregationId(congregationId: number | string) {
    return api.get(`/teams?congregation_id=${congregationId}`);
  },

  async getTeamById(id: number | string) {
    return api.get(`/teams/${id}`);
  },

  async updateTeam(id: number | string, data: Team) {
    return api.put(`/teams/${id}`, data);
  },

  async deleteTeam(id: number | string) {
    return api.delete(`/teams/${id}`);
  },
};
