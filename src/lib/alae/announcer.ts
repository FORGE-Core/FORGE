export type AnnouncePriority = "polite" | "assertive";

type Listener = (message: string, priority: AnnouncePriority) => void;

const listeners = new Set<Listener>();

/** Registra el componente que renderiza las regiones aria-live. */
export function subscribeAnnouncer(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Anuncia un mensaje a lectores de pantalla (NVDA, JAWS, VoiceOver, Narrator). */
export function announce(
  message: string,
  priority: AnnouncePriority = "polite"
) {
  const trimmed = message.trim();
  if (!trimmed) return;
  listeners.forEach((listener) => listener(trimmed, priority));
}
