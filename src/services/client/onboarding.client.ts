import { apiRequest } from "./http";

export const onboardingClient = {
  getStatus() {
    return apiRequest<{
      completed: boolean;
      steps: { documents: boolean; team: boolean; chat: boolean };
      isAdmin: boolean;
    }>("/api/onboarding/status");
  },
};
