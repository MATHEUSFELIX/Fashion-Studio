import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  tone?: "neutral" | "ai" | "human" | "system" | "success";
}

const tones = {
  neutral: "bg-ink/5 text-ink/70",
  ai: "bg-moss/10 text-moss",
  human: "bg-clay/10 text-clay",
  system: "bg-citron/30 text-ink",
  success: "bg-emerald-100 text-emerald-800",
};

export function Badge({ children, tone = "neutral" }: BadgeProps) {
  return (
    <span className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}
