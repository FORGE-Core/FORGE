"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Loader2, UserPlus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TeamUser = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  status: string;
  _count: { progress: number; activityAttempts: number };
};

export default function TeamPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<TeamUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [creating, setCreating] = useState(false);

  const role = session?.user?.role;
  const isAdmin = role === "ADMIN";
  const canViewTeam = role === "ADMIN" || role === "SUPERVISOR";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Sin acceso");
        return;
      }
      setUsers(data.users ?? []);
      setError(null);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canViewTeam) load();
    else setLoading(false);
  }, [canViewTeam, load]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password, role: "EMPLOYEE" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al crear");
      setEmail("");
      setName("");
      setPassword("");
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setCreating(false);
    }
  }

  async function approveUser(id: string) {
    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "ACTIVE" }),
    });
    if (res.ok) load();
  }

  if (!canViewTeam) {
    return (
      <div className="space-y-4">
        <h1 className="font-heading text-3xl font-bold">Equipo</h1>
        <p className="text-brand-muted-gray">
          Esta vista está disponible para administradores y supervisores.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8 max-w-4xl">
      <div>
        <Badge className="mb-3">Administración</Badge>
        <h1 className="font-heading text-3xl font-bold">Equipo</h1>
        <p className="mt-1 text-brand-muted-gray">
          Invita empleados y supervisa su acceso
        </p>
      </div>

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
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
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
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin text-brand-muted-gray" />
          ) : (
            users.map((u) => (
              <div
                key={u.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-black/5 px-4 py-3"
              >
                <div>
                  <Link
                    href={`/dashboard/team/${u.id}`}
                    className="font-medium text-sm hover:text-brand-cobalt"
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
                  {u.status === "PENDING" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => approveUser(u.id)}
                    >
                      Aprobar
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
