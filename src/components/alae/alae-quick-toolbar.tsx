"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Contrast,
  GripVertical,
  Minus,
  Moon,
  Plus,
  Volume2,
  VolumeX,
} from "lucide-react";
import { motion, useDragControls } from "framer-motion";
import { useAccessibility } from "./accessibility-provider";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "alae-toolbar-position";
const TOOLBAR_WIDTH = 56;
const TOOLBAR_HEIGHT = 248;

type Position = { x: number; y: number };

function getDefaultPosition(): Position {
  if (typeof window === "undefined") return { x: 88, y: 400 };
  return {
    x: 88,
    y: Math.max(16, window.innerHeight - TOOLBAR_HEIGHT - 96),
  };
}

function clampPosition({ x, y }: Position): Position {
  if (typeof window === "undefined") return { x, y };
  return {
    x: Math.min(Math.max(8, x), window.innerWidth - TOOLBAR_WIDTH - 8),
    y: Math.min(Math.max(8, y), window.innerHeight - TOOLBAR_HEIGHT - 8),
  };
}

function readStoredPosition(): Position | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Position;
    if (typeof parsed.x === "number" && typeof parsed.y === "number") {
      return clampPosition(parsed);
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function AlaeQuickToolbar() {
  const dragControls = useDragControls();
  const constraintsRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position | null>(null);

  const {
    fontScale,
    highContrast,
    darkMode,
    autoReadAloud,
    reduceMotion,
    updatePreferences,
    stopSpeaking,
  } = useAccessibility();

  useEffect(() => {
    setPosition(readStoredPosition() ?? getDefaultPosition());
  }, []);

  const persistPosition = useCallback((next: Position) => {
    const clamped = clampPosition(next);
    setPosition(clamped);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clamped));
  }, []);

  useEffect(() => {
    if (!position) return;

    const onResize = () => persistPosition(position);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [position, persistPosition]);

  if (!position) return null;

  return (
    <div
      ref={constraintsRef}
      className="pointer-events-none fixed inset-0 z-40 hidden md:block"
      aria-hidden
    >
      <motion.div
        drag
        dragControls={dragControls}
        dragListener={false}
        dragMomentum={!reduceMotion}
        dragElastic={reduceMotion ? 0 : 0.08}
        dragConstraints={constraintsRef}
        style={{ x: position.x, y: position.y }}
        onDragEnd={(_, info) => {
          persistPosition({
            x: position.x + info.offset.x,
            y: position.y + info.offset.y,
          });
        }}
        className={cn(
          "pointer-events-auto absolute top-0 left-0 flex w-14 flex-col gap-1 rounded-2xl border p-2 shadow-lg backdrop-blur",
          "border-border bg-card/95 text-card-foreground",
          "ring-1 ring-black/5 dark:ring-white/10"
        )}
        role="toolbar"
        aria-label="Accesibilidad rápida"
      >
        <button
          type="button"
          onPointerDown={(event) => dragControls.start(event)}
          className={cn(
            "flex h-7 w-full cursor-grab items-center justify-center rounded-lg text-muted-foreground active:cursor-grabbing",
            "hover:bg-accent hover:text-accent-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          )}
          aria-label="Mover barra de accesibilidad"
          title="Arrastrar para mover"
        >
          <GripVertical className="h-4 w-4" aria-hidden />
        </button>

        <ToolbarButton
          label="Reducir texto"
          onClick={() =>
            void updatePreferences({
              fontScale: Math.max(0.875, fontScale - 0.125),
            })
          }
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Aumentar texto"
          onClick={() =>
            void updatePreferences({
              fontScale: Math.min(2, fontScale + 0.125),
            })
          }
        >
          <Plus className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Alto contraste"
          active={highContrast}
          onClick={() => void updatePreferences({ highContrast: !highContrast })}
        >
          <Contrast className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Modo oscuro"
          active={darkMode}
          onClick={() => void updatePreferences({ darkMode: !darkMode })}
        >
          <Moon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          label={autoReadAloud ? "Desactivar lectura" : "Lectura automática"}
          active={autoReadAloud}
          onClick={() => {
            if (autoReadAloud) stopSpeaking();
            void updatePreferences({ autoReadAloud: !autoReadAloud });
          }}
        >
          {autoReadAloud ? (
            <Volume2 className="h-4 w-4" />
          ) : (
            <VolumeX className="h-4 w-4" />
          )}
        </ToolbarButton>
      </motion.div>
    </div>
  );
}

function ToolbarButton({
  children,
  label,
  active,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      )}
    >
      {children}
    </button>
  );
}
