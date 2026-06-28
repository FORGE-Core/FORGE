import { apiRequest } from "./http";

export const trainingClient = {
  listModules() {
    return apiRequest<{ modules: unknown[] }>("/api/training-modules");
  },

  createModule(body: Record<string, unknown>) {
    return apiRequest("/api/training-modules", {
      method: "POST",
      body,
    });
  },

  getModule(slug: string) {
    return apiRequest<{ module?: unknown }>(`/api/training-modules/${slug}`);
  },

  uploadModuleVideo(slug: string, formData: FormData) {
    return apiRequest(`/api/training-modules/${slug}/video`, {
      method: "POST",
      body: formData,
    });
  },

  deleteModuleVideo(slug: string) {
    return apiRequest(`/api/training-modules/${slug}/video`, {
      method: "DELETE",
    });
  },

  updateModule(slug: string, body: Record<string, unknown>) {
    return apiRequest(`/api/training-modules/${slug}`, {
      method: "PATCH",
      body,
    });
  },

  deleteModule(slug: string) {
    return apiRequest(`/api/training-modules/${slug}`, {
      method: "DELETE",
    });
  },
};
