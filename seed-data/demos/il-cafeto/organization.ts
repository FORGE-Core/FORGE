import type { SeedAdminUser, SeedOrganizationConfig, SeedStaffUser } from "@/lib/seed/types";

export const organization: SeedOrganizationConfig = {
  name: "Il Cafeto",
  slug: "il-cafeto",
  industry: "Restaurante / Cafetería",
  logoUrl: null,
  settings: {
    city: "Bogotá",
    country: "Colombia",
    branding: {
      primary: "#581c22",
      secondary: "#9f1239",
      accent: "#fff1f2",
    },
    posRoutePrefix: "/aion/",
    trainingProgram: "Aion Restaurant POS",
    version: "1.0",
  },
};

export const admin: SeedAdminUser = {
  email: "admin@ilcafeto.com",
  password: "ilcafeto2024!",
  name: "Administrador Il Cafeto",
};

export const staff: SeedStaffUser[] = [
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
