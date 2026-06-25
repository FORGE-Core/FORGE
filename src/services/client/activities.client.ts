import { apiRequest } from "./http";

export const activitiesClient = {
  getAtIndex(params: { moduleId?: string; index?: number }) {
    const search = new URLSearchParams();
    if (params.moduleId) search.set("moduleId", params.moduleId);
    if (params.index !== undefined) search.set("index", String(params.index));
    return apiRequest<{ activity?: unknown }>(`/api/activities?${search}`);
  },

  submitAttempt(
    activityId: string,
    body: Record<string, unknown>
  ) {
    return apiRequest<{ passed?: boolean; explanation?: string }>(
      `/api/activities/${activityId}/attempt`,
      {
        method: "POST",
        body,
      }
    );
  },

  getSimulation(index: number) {
    return apiRequest<{ simulation?: unknown }>(`/api/simulations?index=${index}`);
  },

  submitSimulationAttempt(simulationId: string, body: { selectedId: string }) {
    return apiRequest(`/api/simulations/${simulationId}/attempt`, {
      method: "POST",
      body,
    });
  },
};
