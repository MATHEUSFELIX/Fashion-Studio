import type { ReactNode } from "react";
import { Link } from "react-router-dom";

interface LinkButtonProps {
  children: ReactNode;
  to: string;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
}

const styles = {
  primary: "bg-ink text-paper hover:bg-black",
  secondary: "border border-ink/15 bg-white/70 text-ink hover:bg-white",
  ghost: "text-ink/70 hover:bg-ink/5 hover:text-ink",
};

export function LinkButton({
  children,
  to,
  className = "",
  variant = "primary",
}: LinkButtonProps) {
  return (
    <Link
      className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition ${styles[variant]} ${className}`}
      to={to}
    >
      {children}
    </Link>
  );
}
