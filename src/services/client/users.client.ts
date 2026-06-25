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
};
