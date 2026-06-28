import { apiRequest } from "./http";

export const alaeClient = {
  adapt(body: Record<string, unknown>) {
    return apiRequest<{
      content?: string;
      steps?: { order: number; title: string; body: string }[];
    }>("/api/alae/adapt", { method: "POST", body });
  },

  recordModality(body: Record<string, unknown>) {
    return apiRequest("/api/alae/modality", { method: "POST", body });
  },

  bulkInclusionAudit() {
    return apiRequest("/api/alae/inclusion-audit/bulk", { method: "POST" });
  },
};
