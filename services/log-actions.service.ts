import { api } from "./api";

export interface LogAction {
  id: number;
  action: "CREATE" | "UPDATE" | "DELETE";
  entity: "PublisherReport" | "Team" | "Person";
  entity_id: number;
  before?: any;
  after?: any;
  ip?: string;
  createdAt: string;
  user: {
    id: number;
    first_name: string;
    last_name: string;
  };
  person_name?: string;
}

export interface LogActionsResponse {
  data: LogAction[];
  meta: {
    total: number;
    page: number;
    last_page: number;
  };
}

export const logActionsService = {
  findAll(query: { page?: number; limit?: number } = {}) {
    const params = new URLSearchParams();
    if (query.page) params.append("page", query.page.toString());
    if (query.limit) params.append("limit", query.limit.toString());

    return api.get(`/log-actions?${params.toString()}`) as Promise<LogActionsResponse>;
  },
};
