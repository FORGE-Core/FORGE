import { apiRequest } from "./http";

export const usersClient = {
  list() {
    return apiRequest<{ users: unknown[] }>("/api/users");
  },

  create(body: Record<string, unknown>) {
    return apiRequest("/api/users", { method: "POST", body });
  },

  get(id: string) {
    return apiRequest(`/api/users/${id}`);
  },

  update(id: string, body: Record<string, unknown>) {
    return apiRequest(`/api/users/${id}`, { method: "PATCH", body });
  },

  getAccessibility(id: string) {
    return apiRequest<{ user: unknown; profile: unknown }>(
      `/api/users/${id}/accessibility`
    );
  },

  updateAccessibility(id: string, body: Record<string, unknown>) {
    return apiRequest<{ user: unknown; profile: unknown }>(
      `/api/users/${id}/accessibility`,
      { method: "PATCH", body }
    );
  },
};
