"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, UserPlus, Users } from "lucide-react";
import { FeedbackBanner } from "@/components/shared/feedback-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TeamMember } from "@/lib/team/members";
import { usersClient } from "@/services/client";
import { ApiClientError } from "@/services/client/http";
import { useTenantPermissions } from "@/providers/tenant-provider";

type TeamContentProps = {
  initialUsers: TeamMember[];
};

export function TeamContent({ initialUsers }: TeamContentProps) {
  const { isAdmin } = useTenantPermissions();
  const [users, setUsers] = useState(initialUsers);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  async function refreshUsers() {
    const data = await usersClient.list();
    setUsers((data.users ?? []) as TeamMember[]);
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setSuccess(null);
    try {
      await usersClient.create({ email, name, password, role: "EMPLOYEE" });
      setEmail("");
      setName("");
      setPassword("");
      setSuccess("Usuario creado correctamente");
      await refreshUsers();
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Error"
      );
    } finally {
      setCreating(false);
    }
  }

  async function approveUser(id: string) {
    setApprovingId(id);
    setError(null);
    setSuccess(null);
    try {
      await usersClient.update(id, { status: "ACTIVE" });
      setSuccess("Usuario aprobado");
      await refreshUsers();
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : "Error al aprobar"
      );
    } finally {
      setApprovingId(null);
    }
  }

  return (
    <div className="max-w-4xl space-y-8 pb-8">
      <div>
        <Badge className="mb-3">Administración</Badge>
        <h1 className="font-heading text-3xl font-bold">Equipo</h1>
        <p className="mt-1 text-brand-muted-gray">
          Invita empleados y supervisa su acceso
        </p>
      </div>

      {error && <FeedbackBanner variant="error" message={error} />}
      {success && <FeedbackBanner variant="success" message={success} />}

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Invitar empleado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-2xl border border-black/10 px-4 py-2 text-sm"
              />
              <input
                type="email"
                required
                placeholder="correo@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-2xl border border-black/10 px-4 py-2 text-sm"
              />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Contraseña temporal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-2xl border border-black/10 px-4 py-2 text-sm sm:col-span-2"
              />
              <Button type="submit" disabled={creating} className="sm:col-span-2">
                {creating ? "Creando…" : "Crear usuario"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Miembros ({users.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {users.length === 0 ? (
            <p className="text-sm text-brand-muted-gray">
              No hay miembros en el equipo todavía.
            </p>
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/5 px-4 py-3"
              >
                <div>
                  <Link
                    href={`/team/${u.id}`}
                    className="text-sm font-medium hover:text-brand-cobalt"
                  >
                    {u.name ?? u.email}
                  </Link>
                  <p className="text-xs text-brand-muted-gray">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="muted">{u.role}</Badge>
                  <Badge
                    variant={u.status === "ACTIVE" ? "default" : "muted"}
                  >
                    {u.status}
                  </Badge>
                  {u.status === "PENDING" && isAdmin && (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={approvingId === u.id}
                      onClick={() => approveUser(u.id)}
                    >
                      {approvingId === u.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Aprobar"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
