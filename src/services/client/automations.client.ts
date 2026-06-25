import { apiRequest } from "./http";

export const automationsClient = {
  list() {
    return apiRequest<{ automations: unknown[] }>("/api/automations");
  },

  create(body: Record<string, unknown>) {
    return apiRequest("/api/automations", { method: "POST", body });
  },

  update(id: string, body: Record<string, unknown>) {
    return apiRequest(`/api/automations/${id}`, { method: "PATCH", body });
  },

  delete(id: string) {
    return apiRequest(`/api/automations/${id}`, { method: "DELETE" });
  },
};
