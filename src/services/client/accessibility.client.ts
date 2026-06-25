import { apiRequest } from "./http";

type ProfileResponse = {
  profile?: {
    wizardCompleted?: boolean;
    [key: string]: unknown;
  };
};

export const accessibilityClient = {
  getProfile() {
    return apiRequest<ProfileResponse>("/api/accessibility/profile");
  },

  updateProfile(body: Record<string, unknown>) {
    return apiRequest<ProfileResponse>("/api/accessibility/profile", {
      method: "PATCH",
      body,
    });
  },

  getLearningProfile() {
    return apiRequest<{ profile?: unknown }>("/api/learning-profile");
  },

  updateLearningProfile(body: Record<string, unknown>) {
    return apiRequest("/api/learning-profile", { method: "PATCH", body });
  },
};
