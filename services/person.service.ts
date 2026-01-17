import { api } from "@/services/api";
import { Person } from "@/types/person.types";

export const personService = {
  async createPerson(data: Person) {
    return api.post("/people", data);
  },

  async getPersonsByCongregationId(congregationId: number | string) {
    return api.get(`/congregations/${congregationId}/people`);
  },

  async getPersonById(id: number | string) {
    return api.get(`/people/${id}`);
  },

  async updatePerson(id: number | string, data: Person) {
    return api.put(`/people/${id}`, data);
  },

  async deletePerson(id: number | string) {
    return api.delete(`/people/${id}`);
  },
};
