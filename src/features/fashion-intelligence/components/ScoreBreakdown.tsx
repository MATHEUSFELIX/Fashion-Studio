import { Panel } from "@/components/panels/Panel";

interface ScoreBreakdownProps {
  title?: string;
  scores: object;
}

function labelize(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

export function ScoreBreakdown({ title = "Score Breakdown", scores }: ScoreBreakdownProps) {
  return (
    <Panel>
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {Object.entries(scores as Record<string, number>).map(([key, value]) => (
          <div key={key}>
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-semibold text-ink/70">{labelize(key)}</span>
              <span className="font-semibold">{value}</span>
            </div>
            <div className="mt-2 h-2 rounded bg-ink/10">
              <div className="h-2 rounded bg-moss" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
