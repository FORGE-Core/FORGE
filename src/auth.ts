import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import type { NextAuthConfig } from "next-auth";
import { authConfig } from "@/auth.config";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const providers: NextAuthConfig["providers"] = [];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
}

providers.push(
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Contraseña", type: "password" },
    },
    async authorize(credentials) {
      const parsed = credentialsSchema.safeParse(credentials);
      if (!parsed.success) return null;

      const email = parsed.data.email.toLowerCase().trim();
      const user = await db.user.findUnique({ where: { email } });
      if (!user?.passwordHash) return null;

      const valid = await bcrypt.compare(
        parsed.data.password,
        user.passwordHash
      );
      if (!valid || user.status !== "ACTIVE") return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        organizationId: user.organizationId,
        role: user.role,
      };
    },
  })
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = user.email?.toLowerCase().trim();
        if (!email) return "/login?error=GoogleAccountNotLinked";

        const existing = await db.user.findUnique({ where: { email } });
        if (!existing?.organizationId) {
          return "/login?error=GoogleAccountNotLinked";
        }
        if (existing.status !== "ACTIVE") {
          return "/login?error=AccountPending";
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user?.email && account?.provider === "google") {
        const dbUser = await db.user.findUnique({
          where: { email: user.email.toLowerCase().trim() },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.organizationId = dbUser.organizationId;
          token.role = dbUser.role;
        }
        return token;
      }

      if (user) {
        token.id = user.id;
        token.organizationId = user.organizationId;
        token.role = user.role;
      }
      return token;
    },
  },
});
