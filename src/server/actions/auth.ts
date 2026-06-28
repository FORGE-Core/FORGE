"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { provisionTenantSchema } from "@/lib/db/provision-tenant";

const registerSchema = z.object({
  companyName: z.string().min(2, "Nombre de empresa muy corto"),
  email: z.string().email("Correo inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

async function uniqueSlug(base: string) {
  let slug = slugify(base) || "empresa";
  let n = 0;
  while (await db.organization.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${slugify(base) || "empresa"}-${n}`;
  }
  return slug;
}

export type AuthActionResult =
  | { ok: true; email: string }
  | { ok: false; error: string };

export async function registerAction(
  formData: FormData
): Promise<AuthActionResult> {
  const parsed = registerSchema.safeParse({
    companyName: formData.get("companyName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, error: parsed.error.errors[0]?.message ?? "Datos inválidos" };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false, error: "Ya existe una cuenta con este correo" };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const slug = await uniqueSlug(parsed.data.companyName);

  let orgId: string | undefined;

  await db.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        name: parsed.data.companyName.trim(),
        slug,
      },
    });

    orgId = org.id;

    await tx.user.create({
      data: {
        email,
        name: parsed.data.companyName.trim(),
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
        organizationId: org.id,
      },
    });
  });

  // Provisionar schema del tenant de forma síncrona para que las tablas
  // existan antes de que el usuario haga su primer login
  if (orgId) {
    try {
      await provisionTenantSchema(orgId);
    } catch (err) {
      console.error("[tenant] Error al provisionar schema:", err);
      // No bloquear el registro si el provisioning falla
    }
  }

  return { ok: true, email };
}
