"use client";

import { motion } from "framer-motion";
import { Bot, FileText, Link2, Send, ShieldCheck, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  chatSidebarDocs,
  chatSuggestions,
} from "@/data/mock-content";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content:
        "Hola, soy tu mentor de capacitación. Pregúntame sobre procesos, manuales o procedimientos de tu empresa.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastSources, setLastSources] = useState<string[]>([]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content }),
      });

      const raw = await res.text();
      let data: { answer?: string; error?: string };
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error(
          res.ok
            ? "Respuesta inválida del servidor"
            : raw.slice(0, 120) || `Error del servidor (${res.status})`
        );
      }

      if (!res.ok || data.error) {
        throw new Error(data.error ?? `No pude procesar tu pregunta (${res.status})`);
      }

      setLastSources(
        chatSidebarDocs.filter((d) => d.used).map((d) => d.name)
      );

      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.answer ?? "No pude procesar tu pregunta.",
        },
      ]);
    } catch (err) {
      const text =
        err instanceof Error
          ? err.message
          : "Error de conexión. Intenta de nuevo.";
      setMessages((m) => [
        ...m,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: text,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
      <div className="flex h-[calc(100vh-8rem)] flex-col rounded-[24px] border border-black/5 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-black/5 px-6 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-brand">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-heading font-semibold">Mentor IA</h2>
            <p className="text-xs text-brand-muted-gray">
              Respuestas basadas en tu documentación
            </p>
          </div>
        </div>

        <div className="border-b border-black/5 px-4 py-3">
          <p className="mb-2 text-xs font-medium text-brand-muted-gray">
            Sugerencias rápidas
          </p>
          <div className="flex flex-wrap gap-2">
            {chatSuggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => sendMessage(s)}
                className="rounded-full border border-black/5 bg-brand-light-bg px-3 py-1.5 text-xs transition-colors hover:border-brand-cobalt/30 hover:bg-brand-champagne"
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div
          className="flex-1 overflow-y-auto p-6 space-y-4"
          role="log"
          aria-live="polite"
        >
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-3",
                msg.role === "user" && "flex-row-reverse"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                  msg.role === "assistant"
                    ? "gradient-brand text-white"
                    : "bg-brand-champagne text-brand-cobalt"
                )}
              >
                {msg.role === "assistant" ? (
                  <Bot className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "assistant"
                    ? "bg-brand-light-bg"
                    : "gradient-brand text-white"
                )}
              >
                {msg.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex gap-1 px-12">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                  className="h-2 w-2 rounded-full bg-brand-lavender"
                />
              ))}
            </div>
          )}
        </div>

        <form
          onSubmit={handleSend}
          className="flex gap-3 border-t border-black/5 p-4"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta sobre un proceso..."
            className="flex-1 rounded-2xl border border-black/10 bg-brand-light-bg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-cobalt/30"
            aria-label="Mensaje para el mentor IA"
          />
          <Button type="submit" size="icon" disabled={loading}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <aside className="hidden space-y-4 xl:block">
        <Card className="border-emerald-200/50 bg-emerald-50/30">
          <CardContent className="flex gap-3 pt-6">
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
            <p className="text-sm leading-relaxed text-emerald-900">
              La respuesta fue generada usando documentación oficial de la empresa.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="h-4 w-4" />
              Documentos utilizados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(lastSources.length ? lastSources : chatSidebarDocs.filter((d) => d.used).map((d) => d.name)).map(
              (name) => (
                <div
                  key={name}
                  className="rounded-xl bg-brand-light-bg px-3 py-2 text-xs font-medium"
                >
                  {name}
                </div>
              )
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Link2 className="h-4 w-4" />
              Procesos vinculados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {["Proceso de devoluciones", "Flujo de despacho", "Control de inventario"].map(
              (p) => (
                <div
                  key={p}
                  className="rounded-xl border border-black/5 px-3 py-2 text-brand-muted-gray hover:text-brand-cobalt"
                >
                  {p}
                </div>
              )
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
