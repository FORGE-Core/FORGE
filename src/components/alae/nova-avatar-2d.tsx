"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type AvatarState = "idle" | "listening" | "thinking" | "speaking";

export function NovaAvatar2D({
  size = 48,
  state = "idle",
  className,
}: {
  size?: number;
  state?: AvatarState;
  className?: string;
}) {
  const eyeY = state === "speaking" ? 18 : 17;

  return (
    <motion.div
      className={cn("relative shrink-0", className)}
      style={{ width: size, height: size }}
      animate={
        state === "thinking"
          ? { rotate: [0, -3, 3, 0] }
          : state === "listening"
            ? { scale: [1, 1.05, 1] }
            : {}
      }
      transition={{ repeat: Infinity, duration: 1.2 }}
      aria-hidden
    >
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        className="drop-shadow-md"
      >
        <defs>
          <linearGradient id="nova-face" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a384ec" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
        </defs>
        <circle cx="32" cy="32" r="30" fill="url(#nova-face)" />
        <ellipse cx="32" cy="38" rx="14" ry="10" fill="white" opacity="0.15" />
        <circle cx="24" cy={eyeY} r="4" fill="white" />
        <circle cx="40" cy={eyeY} r="4" fill="white" />
        <circle cx="25" cy={eyeY} r="1.5" fill="#4f46e5" />
        <circle cx="41" cy={eyeY} r="1.5" fill="#4f46e5" />
        {state === "speaking" ? (
          <motion.ellipse
            cx="32"
            cy="42"
            rx="6"
            ry="3"
            fill="white"
            animate={{ ry: [2, 5, 2] }}
            transition={{ repeat: Infinity, duration: 0.4 }}
          />
        ) : (
          <path
            d="M 26 42 Q 32 45 38 42"
            stroke="white"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        )}
        {state === "listening" && (
          <motion.circle
            cx="32"
            cy="32"
            r="30"
            fill="none"
            stroke="white"
            strokeWidth="2"
            opacity="0.5"
            animate={{ r: [30, 34, 30], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
      </svg>
    </motion.div>
  );
}
