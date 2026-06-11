"use client";

import { Hand } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TERMS = [
  {
    term: "Hola / Bienvenido",
    desc: "Saludo inicial en recepción o inducción.",
    hint: "Mano abierta, movimiento lateral suave.",
  },
  {
    term: "Ayuda",
    desc: "Solicitar apoyo a supervisor o compañero.",
    hint: "Puño cerrado sobre palma abierta, movimiento hacia arriba.",
  },
  {
    term: "Entendido",
    desc: "Confirmar que comprendiste una instrucción.",
    hint: "Pulgar hacia arriba o asentimiento con mano.",
  },
  {
    term: "Espera",
    desc: "Pausar una acción o proceso.",
    hint: "Palma abierta hacia adelante, como señal de alto.",
  },
  {
    term: "Peligro",
    desc: "Alerta de riesgo en operaciones.",
    hint: "Ambas manos en X o gesto de alerta visible.",
  },
  {
    term: "Gracias",
    desc: "Cierre positivo tras capacitación o ayuda.",
    hint: "Mano desde mentón hacia adelante.",
  },
];

export function SignGlossary() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Hand className="h-5 w-5 text-brand-cobalt" aria-hidden />
          <CardTitle className="text-base">Glosario inclusivo (LSM)</CardTitle>
        </div>
        <p className="text-sm text-brand-muted-gray">
          Referencia básica para equipos con diversidad auditiva. Próximamente:
          video y avatar con señas.
        </p>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {TERMS.map((t) => (
          <div
            key={t.term}
            className="rounded-xl border border-brand-cobalt/15 bg-brand-champagne/20 px-4 py-3"
          >
            <p className="font-medium text-sm">{t.term}</p>
            <p className="mt-1 text-xs text-brand-muted-gray">{t.desc}</p>
            <p className="mt-2 text-xs italic text-brand-cobalt/80">{t.hint}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
