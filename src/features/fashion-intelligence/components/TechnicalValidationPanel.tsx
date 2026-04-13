import { useModels } from "@/app/providers/modelContext";
import { Panel } from "@/components/panels/Panel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useTechnicalValidation } from "@/features/fashion-intelligence/hooks/useTechnicalValidation";
import type { TechnicalValidationContext } from "@/features/fashion-intelligence/types/intelligence";

const statusTone = {
  pass: "success",
  warning: "system",
  fail: "human",
} as const;

export function TechnicalValidationPanel({ context }: { context: TechnicalValidationContext }) {
  const { selectedTextModel } = useModels();
  const { result, isLoading, error, run } = useTechnicalValidation(selectedTextModel, context);

  return (
    <div className="space-y-5">
      <Panel>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="ai">Technical Validation</Badge>
              {result ? <Badge tone="success">Saved result</Badge> : null}
            </div>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">Production readiness check</h3>
            <p className="mt-2 max-w-2xl text-sm text-ink/60">
              Validates technical fields, construction clarity, operational risks, and production handoff gaps.
            </p>
          </div>
          <Button disabled={isLoading || !context.sku} onClick={run} type="button">
            {isLoading ? "Checking..." : result ? "Rerun Validation" : "Run Technical Validation"}
          </Button>
        </div>
        {error ? <p className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}
      </Panel>

      {result ? (
        <>
          <Panel>
            <h3 className="text-lg font-semibold">Validation summary</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">{result.validationSummary}</p>
          </Panel>

          <Panel>
            <h3 className="text-lg font-semibold">Checklist</h3>
            <div className="mt-4 space-y-3">
              {result.checklist.map((item) => (
                <div className="flex flex-col gap-2 rounded-md border border-ink/10 bg-white/70 p-4 md:flex-row md:items-center md:justify-between" key={item.label}>
                  <div>
                    <p className="font-semibold">{item.label}</p>
                    <p className="mt-1 text-sm text-ink/60">{item.note}</p>
                  </div>
                  <Badge tone={statusTone[item.status]}>{item.status}</Badge>
                </div>
              ))}
            </div>
          </Panel>

          <div className="grid gap-5 lg:grid-cols-2">
            <ListPanel items={result.missingFields} title="Missing information" />
            <ListPanel items={result.inconsistencies} title="Inconsistencies" />
            <ListPanel items={result.productionRisks} title="Production risks" />
            <ListPanel items={result.commercialConcerns} title="Commercial concerns" />
            <ListPanel items={result.brandConcerns} title="Brand concerns" />
            <ListPanel items={result.recommendedFixes} title="Recommended fixes" />
          </div>
        </>
      ) : null}
    </div>
  );
}

function ListPanel({ title, items }: { title: string; items: string[] }) {
  return (
    <Panel>
      <h3 className="text-lg font-semibold">{title}</h3>
      <ul className="mt-4 space-y-2 text-sm text-ink/70">
        {items.map((item) => (
          <li className="rounded-md bg-ink/5 p-3" key={item}>
            {item}
          </li>
        ))}
      </ul>
    </Panel>
  );
}
