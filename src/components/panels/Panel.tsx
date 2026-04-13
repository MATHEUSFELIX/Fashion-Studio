import type { ReactNode } from "react";

interface PanelProps {
  children: ReactNode;
  className?: string;
}

export function Panel({ children, className = "" }: PanelProps) {
  return (
    <section className={`rounded-lg border border-ink/10 bg-white/68 p-5 shadow-soft ${className}`}>
      {children}
    </section>
  );
}
