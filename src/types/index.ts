export type { UserRole, UserStatus, ActivityType, DocumentType } from "@prisma/client";

export interface TenantContext {
  organizationId: string;
  userId: string;
  role: "ADMIN" | "SUPERVISOR" | "EMPLOYEE";
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}
