"use client";

import { motion } from "framer-motion";
import {
  Bot,
  FileText,
  History,
  Link2,
  Plus,
  Send,
  ShieldCheck,
  User,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface EnrichedSource {
  documentTitle: string;
  confidence: string;
}

type ConversationPreview = {
  id: string;
  title: string;
  preview: string;
  updatedAt: string;
};

export function AIChat() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get("prompt");
  const promptedRef = useRef(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content:
        "Hola, soy NOVA, tu mentor de capacitación. Pregúntame sobre procesos, manuales o procedimientos de tu empresa.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<EnrichedSource[]>([]);
  const [processes, setProcesses] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [officialDocs, setOfficialDocs] = useState(false);
  const [confidence, setConfidence] = useState<"high" | "medium" | "low">(
    "medium"
  );
  const [history, setHistory] = useState<ConversationPreview[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/conversations");
      const data = await res.json();
      if (res.ok) setHistory(data.conversations ?? []);
    } catch {
      /* historial opcional */
    }
  }, []);

  const loadSuggestions = useCallback(async () => {
    try {
      const res = await fetch("/api/chat/suggestions");
      const data = await res.json();
      if (res.ok) {
        setSuggestions(data.suggestions ?? []);
        setProcesses(data.processes ?? []);
      }
    } catch {
      /* sugerencias por defecto en UI */
    }
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text.trim(),
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setLoading(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages((m) => [
      ...m,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          conversationId,
        }),
      });

      if (!res.ok || !res.body) {
        const errText = await res.text();
        throw new Error(errText.slice(0, 120) || `Error (${res.status})`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullAnswer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const lines = part.split("\n");
          let event = "message";
          let dataStr = "";
          for (const line of lines) {
            if (line.startsWith("event: ")) event = line.slice(7);
            if (line.startsWith("data: ")) dataStr = line.slice(6);
          }
          if (!dataStr) continue;
          const payload = JSON.parse(dataStr) as Record<string, unknown>;

          if (event === "meta") {
            if (payload.conversationId) {
              setConversationId(payload.conversationId as string);
              void loadHistory();
            }
            setSources((payload.sources as EnrichedSource[]) ?? []);
            setOfficialDocs(!!payload.officialDocs);
            setConfidence(
              (payload.confidence as "high" | "medium" | "low") ?? "medium"
            );
          } else if (event === "token" && payload.text) {
            fullAnswer += payload.text as string;
            setMessages((m) =>
              m.map((msg) =>
                msg.id === assistantId
                  ? { ...msg, content: fullAnswer }
                  : msg
              )
            );
          } else if (event === "error") {
            throw new Error((payload.error as string) ?? "Error de streaming");
          }
        }
      }

      if (!fullAnswer) {
        setMessages((m) =>
          m.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: "No pude procesar tu pregunta." }
              : msg
          )
        );
      }
    } catch (err) {
      const text =
        err instanceof Error
          ? err.message
          : "Error de conexión. Intenta de nuevo.";
      setMessages((m) =>
        m.map((msg) =>
          msg.id === assistantId ? { ...msg, content: text } : msg
        )
      );
    } finally {
      setLoading(false);
    }
  }, [conversationId, loading, loadHistory]);

  const loadConversation = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/conversations/${id}`);
      const data = await res.json();
      if (!res.ok || !data.conversation) return;
      setConversationId(id);
      setMessages(
        data.conversation.messages.map(
          (m: { id: string; role: string; content: string }) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
          })
        )
      );
      setShowHistory(false);
    } catch {
      /* ignorar */
    }
  }, []);

  function startNewConversation() {
    setConversationId(null);
    setMessages([
      {
        id: "0",
        role: "assistant",
        content:
          "Hola, soy NOVA, tu mentor de capacitación. Pregúntame sobre procesos, manuales o procedimientos de tu empresa.",
      },
    ]);
    setSources([]);
    setShowHistory(false);
  }

  useEffect(() => {
    loadSuggestions();
    loadHistory();
  }, [loadSuggestions, loadHistory]);

  useEffect(() => {
    if (initialPrompt && !promptedRef.current) {
      promptedRef.current = true;
      sendMessage(initialPrompt);
    }
  }, [initialPrompt, sendMessage]);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  const confidenceLabel = {
    high: "Alta confianza — documentación oficial",
    medium: "Confianza media — revisa las fuentes",
    low: "Sin fuentes en documentos — respuesta general",
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
      <div className="flex h-[calc(100vh-8rem)] flex-col rounded-[24px] border border-black/5 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-black/5 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl gradient-brand">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-heading font-semibold">NOVA · Mentor IA</h2>
              <p className="text-xs text-brand-muted-gray">
                Respuestas basadas en tu documentación
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setShowHistory((v) => !v)}
            >
              <History className="h-4 w-4" />
              Historial
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={startNewConversation}>
              <Plus className="h-4 w-4" />
              Nueva
            </Button>
          </div>
        </div>

        {showHistory && (
          <div className="max-h-40 overflow-y-auto border-b border-black/5 px-4 py-3">
            {history.length === 0 ? (
              <p className="text-xs text-brand-muted-gray">Sin conversaciones previas.</p>
            ) : (
              <div className="space-y-1">
                {history.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => loadConversation(c.id)}
                    className="w-full rounded-xl px-3 py-2 text-left text-xs hover:bg-brand-light-bg"
                  >
                    <p className="font-medium truncate">{c.title}</p>
                    <p className="text-brand-muted-gray truncate">{c.preview}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="border-b border-black/5 px-4 py-3">
          <p className="mb-2 text-xs font-medium text-brand-muted-gray">
            Sugerencias rápidas
          </p>
          <div className="flex flex-wrap gap-2">
            {(suggestions.length > 0
              ? suggestions
              : [
                  "¿Cómo registrar una devolución?",
                  "¿Qué hacer si un paquete se pierde?",
                ]
            ).map((s) => (
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
        <Card
          className={cn(
            officialDocs
              ? "border-emerald-200/50 bg-emerald-50/30"
              : "border-amber-200/50 bg-amber-50/30"
          )}
        >
          <CardContent className="flex gap-3 pt-6">
            <ShieldCheck
              className={cn(
                "h-5 w-5 shrink-0",
                officialDocs ? "text-emerald-600" : "text-amber-600"
              )}
            />
            <p className="text-sm leading-relaxed">
              {officialDocs
                ? "Respuesta generada usando documentación oficial de la empresa."
                : "Sube manuales en Documentos para respuestas con fuentes verificables."}
              <span className="mt-2 block text-xs opacity-80">
                {confidenceLabel[confidence]}
              </span>
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
            {sources.length === 0 ? (
              <p className="text-xs text-brand-muted-gray">
                Las fuentes aparecerán tras tu primera pregunta.
              </p>
            ) : (
              sources.map((s, i) => (
                <div
                  key={`${s.documentTitle}-${i}`}
                  className="rounded-xl bg-brand-light-bg px-3 py-2 text-xs font-medium"
                >
                  {s.documentTitle}
                </div>
              ))
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
            {processes.length === 0 ? (
              <p className="text-xs text-brand-muted-gray">
                No hay procesos registrados aún.
              </p>
            ) : (
              processes.map((p) => (
                <div
                  key={p}
                  className="rounded-xl border border-black/5 px-3 py-2 text-brand-muted-gray"
                >
                  {p}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
