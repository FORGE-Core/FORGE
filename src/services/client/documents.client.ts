import { apiBlob, apiRequest } from "./http";

export const documentsClient = {
  list() {
    return apiRequest<{
      canUpload: boolean;
      canManage: boolean;
      documents: unknown[];
    }>("/api/documents");
  },

  upload(formData: FormData) {
    return apiRequest("/api/documents", {
      method: "POST",
      body: formData,
    });
  },

  delete(id: string) {
    return apiRequest(`/api/documents/${id}`, { method: "DELETE" });
  },

  reprocess(id: string) {
    return apiRequest(`/api/documents/${id}/reprocess`, { method: "POST" });
  },

  generate(id: string) {
    return apiRequest(`/api/documents/${id}/generate`, { method: "POST" });
  },

  downloadFile(id: string) {
    return apiBlob(`/api/documents/${id}/file`);
  },
};
