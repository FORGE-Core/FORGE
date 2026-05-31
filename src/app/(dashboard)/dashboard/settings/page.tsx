import { Settings } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-8 pb-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Ajustes</h1>
        <p className="mt-1 text-brand-muted-gray">
          Configuración de tu organización y preferencias
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Organización</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between rounded-2xl bg-brand-light-bg px-4 py-3">
              <span className="text-brand-muted-gray">Empresa</span>
              <span className="font-medium">LogiExpress MX</span>
            </div>
            <div className="flex justify-between rounded-2xl bg-brand-light-bg px-4 py-3">
              <span className="text-brand-muted-gray">Plan</span>
              <span className="font-medium">Enterprise</span>
            </div>
            <div className="flex justify-between rounded-2xl bg-brand-light-bg px-4 py-3">
              <span className="text-brand-muted-gray">Usuarios activos</span>
              <span className="font-medium">128</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              "Recordatorios de módulos pendientes",
              "Resumen semanal de progreso",
              "Alertas de simulaciones",
            ].map((n) => (
              <label
                key={n}
                className="flex cursor-pointer items-center justify-between rounded-2xl bg-brand-light-bg px-4 py-3"
              >
                <span>{n}</span>
                <input type="checkbox" defaultChecked className="accent-brand-cobalt" />
              </label>
            ))}
          </CardContent>
        </Card>
      </div>

      <EmptyState
        icon={Settings}
        title="Integraciones próximamente"
        description="Conecta Slack, Teams y tu HRIS para sincronizar equipos y automatizar recordatorios."
        actionLabel="Contactar soporte"
        actionHref="mailto:soporte@cappi.app"
      />
    </div>
  );
}
