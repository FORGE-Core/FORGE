import { apiRequest } from "./http";

export const organizationClient = {
  get() {
    return apiRequest("/api/organization");
  },

  update(body: Record<string, unknown>) {
    return apiRequest<{ organization?: Record<string, unknown> }>(
      "/api/organization",
      { method: "PATCH", body }
    );
  },
};
