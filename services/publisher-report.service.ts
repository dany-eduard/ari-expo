import { ShowAlert } from "@/components/alert";
import { api } from "@/services/api";
import { PublisherReport } from "@/types/publisher-report.types";

export const publisherReportService = {
  async createPublisherReport(data: PublisherReport) {
    return api.post("/publisher-reports", data);
  },

  async getPublisherReportsByPersonId(params: {
    person_id: number | string;
    service_year?: number;
    year?: number;
    month?: number;
    limit?: number;
    order?: "asc" | "desc";
  }): Promise<PublisherReport[]> {
    const queryParams = new URLSearchParams();
    queryParams.append("person_id", params.person_id.toString());
    if (params.service_year) queryParams.append("service_year", params.service_year.toString());
    if (params.year) queryParams.append("year", params.year.toString());
    if (params.month) queryParams.append("month", params.month.toString());
    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.order) queryParams.append("order", params.order);

    return api.get(`/publisher-reports?${queryParams.toString()}`);
  },

  async getPublisherReportById(id: number | string) {
    return api.get(`/publisher-reports/${id}`);
  },

  async updatePublisherReport(id: number | string, data: PublisherReport) {
    return api.put(`/publisher-reports/${id}`, data);
  },

  async deletePublisherReport(id: number | string) {
    ShowAlert("Accion no permitida", "No puedes eliminar un reporte. Comunicate con el administrador.");
    return Promise.resolve();
    // return api.delete(`/publisher-reports/${id}`);
  },
};
