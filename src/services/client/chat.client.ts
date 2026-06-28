import { apiRequest } from "./http";

export const chatClient = {
  listConversations() {
    return apiRequest<{ conversations: unknown[] }>("/api/conversations");
  },

  getConversation(id: string) {
    return apiRequest<{
      conversation: {
        messages: { id: string; role: string; content: string }[];
      };
    }>(`/api/conversations/${id}`);
  },

  getSuggestions() {
    return apiRequest<{ suggestions: string[]; processes: string[] }>(
      "/api/chat/suggestions"
    );
  },

  streamMessage(body: { message: string; conversationId: string | null }) {
    return fetch("/api/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  },
};
