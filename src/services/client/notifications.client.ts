import { apiRequest } from "./http";

export const notificationsClient = {
  subscribe(body: Record<string, unknown>) {
    return apiRequest("/api/notifications/subscribe", {
      method: "POST",
      body,
    });
  },

  test() {
    return apiRequest<{ skipped?: boolean; sent?: number }>(
      "/api/notifications/test",
      { method: "POST" }
    );
  },
};
