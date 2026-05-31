import type { TenantAdminSeed, TenantOrganization, TenantStaffSeed } from "@/lib/tenants/types";

export const organization: TenantOrganization = {
  name: "Il Cafeto",
  slug: "il-cafeto",
  industry: "Restaurante / Cafetería",
  logoUrl: null,
  settings: {
    city: "Bogotá",
    country: "Colombia",
    brandColor: "#581c22",
    posRoutePrefix: "/aion/",
    trainingProgram: "Aion Restaurant POS",
    version: "1.0",
  },
};

export const admin: TenantAdminSeed = {
  email: "admin@ilcafeto.com",
  password: "ilcafeto2024!",
  name: "Administrador Il Cafeto",
};

export const staff: TenantStaffSeed[] = [
  {
    email: "staff1@ilcafeto.com",
    password: "Staff1234!",
    name: "Mesero Demo",
    roleTitle: "Mesero",
  },
  {
    email: "staff2@ilcafeto.com",
    password: "Staff1234!",
    name: "Barista Demo",
    roleTitle: "Barista",
  },
  {
    email: "staff3@ilcafeto.com",
    password: "Staff1234!",
    name: "Cajero Demo",
    roleTitle: "Cajero",
  },
];
