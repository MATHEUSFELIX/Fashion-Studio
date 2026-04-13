import type { ReactNode } from "react";
import { Panel } from "@/components/panels/Panel";

interface AsyncBoundaryProps<T> {
  data?: T;
  error?: string;
  isLoading: boolean;
  empty?: boolean;
  children: (data: T) => ReactNode;
}

export function AsyncBoundary<T>({
  data,
  error,
  isLoading,
  empty = false,
  children,
}: AsyncBoundaryProps<T>) {
  if (isLoading) {
    return (
      <Panel>
        <div className="h-28 animate-pulse rounded-md bg-ink/10" />
      </Panel>
    );
  }

  if (error) {
    return (
      <Panel>
        <p className="text-sm font-semibold text-red-700">Unable to load this workspace.</p>
        <p className="mt-1 text-sm text-ink/60">{error}</p>
      </Panel>
    );
  }

  if (!data || empty) {
    return (
      <Panel>
        <p className="text-sm font-semibold">No data yet.</p>
        <p className="mt-1 text-sm text-ink/60">Create a design to start filling this space.</p>
      </Panel>
    );
  }

  return <>{children(data)}</>;
}
