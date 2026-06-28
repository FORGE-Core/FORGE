import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { canViewReports } from "@/lib/auth/roles";
import { getOrganizationModules } from "@/services/server/training/modules.service";
import { ServiceError } from "@/services/server/errors";
import type { AdminContext, OrganizationContext } from "@/services/server/types";
// db (global) is used for shared-schema tables (users)
// ctx.db is used for tenant-schema tables (activityAttempts, messages)

const BCRYPT_ROUNDS = 12;

export async function listUsers(ctx: OrganizationContext) {
  if (!canViewReports(ctx.role)) {
    throw new ServiceError("FORBIDDEN", "Sin permiso");
  }

  return db.user.findMany({
    where: { organizationId: ctx.organizationId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      _count: {
        select: {
          progress: true,
          activityAttempts: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createUser(
  ctx: AdminContext,
  input: {
    email: string;
    name?: string;
    password: string;
    role?: "ADMIN" | "SUPERVISOR" | "EMPLOYEE";
  }
) {
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const role = input.role ?? "EMPLOYEE";

  if (!email || !password || password.length < 6) {
    throw new ServiceError(
      "VALIDATION",
      "Email y contraseña (mín. 6) son obligatorios"
    );
  }

  const exists = await db.user.findUnique({ where: { email } });
  if (exists) {
    throw new ServiceError("CONFLICT", "El email ya está registrado");
  }

  return db.user.create({
    data: {
      email,
      name: input.name?.trim() || null,
      passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
      role,
      status: "ACTIVE",
      organizationId: ctx.organizationId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
    },
  });
}

export async function getTeamMemberDetail(
  ctx: OrganizationContext,
  userId: string
) {
  if (!canViewReports(ctx.role)) {
    throw new ServiceError("FORBIDDEN", "Sin permiso");
  }

  const user = await db.user.findFirst({
    where: { id: userId, organizationId: ctx.organizationId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new ServiceError("NOT_FOUND", "Usuario no encontrado");
  }

  const [modules, attempts, messages] = await Promise.all([
    getOrganizationModules(ctx.organizationId, user.id, ctx.db),
    ctx.db.activityAttempt.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { activity: { select: { title: true, type: true } } },
    }),
    ctx.db.message.count({
      where: {
        role: "user",
        conversation: { userId: user.id, organizationId: ctx.organizationId },
      },
    }),
  ]);

  const overallProgress = modules.length
    ? Math.round(modules.reduce((s, m) => s + m.progress, 0) / modules.length)
    : 0;

  return {
    user,
    overallProgress,
    modules,
    recentAttempts: attempts.map((a) => ({
      id: a.id,
      title: a.activity.title,
      type: a.activity.type,
      passed: a.passed,
      score: a.score,
      at: a.createdAt,
    })),
    chatQuestions: messages,
  };
}

export async function getUserInOrganization(
  ctx: OrganizationContext,
  userId: string
) {
  if (!canViewReports(ctx.role)) {
    throw new ServiceError("FORBIDDEN", "Sin permiso");
  }

  const user = await db.user.findFirst({
    where: { id: userId, organizationId: ctx.organizationId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      progress: {
        include: {
          module: { select: { title: true, slug: true } },
        },
      },
      activityAttempts: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          activity: {
            select: { title: true, type: true, module: { select: { title: true } } },
          },
        },
      },
    },
  });

  if (!user) {
    throw new ServiceError("NOT_FOUND", "Usuario no encontrado");
  }

  return user;
}

export async function updateUser(
  ctx: AdminContext,
  userId: string,
  input: {
    name?: string;
    role?: "ADMIN" | "SUPERVISOR" | "EMPLOYEE";
    status?: "PENDING" | "ACTIVE" | "SUSPENDED";
    password?: string;
  }
) {
  const existing = await db.user.findFirst({
    where: { id: userId, organizationId: ctx.organizationId },
  });

  if (!existing) {
    throw new ServiceError("NOT_FOUND", "Usuario no encontrado");
  }

  const data: {
    name?: string | null;
    role?: "ADMIN" | "SUPERVISOR" | "EMPLOYEE";
    status?: "PENDING" | "ACTIVE" | "SUSPENDED";
    passwordHash?: string;
  } = {};

  if (input.name !== undefined) data.name = input.name.trim() || null;
  if (input.role) data.role = input.role;
  if (input.status) data.status = input.status;
  if (input.password && input.password.length >= 6) {
    data.passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  }

  return db.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
    },
  });
}
