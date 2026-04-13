import { useModels } from "@/app/providers/modelContext";
import { Panel } from "@/components/panels/Panel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PersonaReactionCard } from "@/features/fashion-intelligence/components/PersonaReactionCard";
import { ScoreBreakdown } from "@/features/fashion-intelligence/components/ScoreBreakdown";
import { useDesignValidation } from "@/features/fashion-intelligence/hooks/useDesignValidation";
import type { DesignValidationContext } from "@/features/fashion-intelligence/types/intelligence";

export function DesignValidationPanel({ context }: { context: DesignValidationContext }) {
  const { selectedTextModel } = useModels();
  const { result, isLoading, error, run } = useDesignValidation(selectedTextModel, context);

  return (
    <div className="space-y-5">
      <Panel>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="ai">Design Validation</Badge>
              {result ? <Badge tone="success">Saved result</Badge> : null}
            </div>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">Validate design against brief</h3>
            <p className="mt-2 max-w-2xl text-sm text-ink/60">
              Checks brief adherence, commercial appeal, creative strength, and refinement priorities for the active SKU.
            </p>
          </div>
          <Button disabled={isLoading || !context.sku} onClick={run} type="button">
            {isLoading ? "Validating..." : result ? "Rerun Validation" : "Validate Design"}
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

          <ScoreBreakdown scores={result.designScore} title="Updated Score" />

          <Panel>
            <h3 className="text-lg font-semibold">Brief adherence</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">{result.briefAdherenceSummary}</p>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <ListBlock items={result.alignedElements} title="Aligned elements" />
              <ListBlock items={result.misalignedElements} title="Misaligned elements" />
            </div>
          </Panel>

          <Panel>
            <h3 className="text-lg font-semibold">Creative/commercial review</h3>
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <ListBlock items={result.creativeStrengths} title="Creative strengths" />
              <ListBlock items={result.commercialStrengths} title="Commercial strengths" />
              <ListBlock items={result.creativeRisks} title="Creative risks" />
              <ListBlock items={result.commercialRisks} title="Commercial risks" />
            </div>
          </Panel>

          <Panel>
            <h3 className="text-lg font-semibold">Audience Simulation</h3>
            <div className="mt-5 space-y-3">
              {result.personaReactions.map((reaction) => (
                <PersonaReactionCard key={reaction.personaId} reaction={reaction} />
              ))}
            </div>
          </Panel>

          <Panel>
            <h3 className="text-lg font-semibold">Refinement suggestions</h3>
            <div className="mt-4 space-y-3">
              {result.refinementSuggestions.map((suggestion) => (
                <div className="rounded-md border border-ink/10 bg-white/70 p-4" key={suggestion.title}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{suggestion.priority}</Badge>
                    <h4 className="font-semibold">{suggestion.title}</h4>
                  </div>
                  <p className="mt-2 text-sm text-ink/65">{suggestion.reason}</p>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-ink/45">
                    Expected impact
                  </p>
                  <p className="mt-1 text-sm text-ink/65">{suggestion.expectedImpact}</p>
                </div>
              ))}
            </div>
          </Panel>
        </>
      ) : null}
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-xs font-bold uppercase tracking-wider text-ink/45">{title}</h4>
      <ul className="mt-3 space-y-2 text-sm text-ink/70">
        {items.map((item) => (
          <li className="rounded-md bg-ink/5 p-3" key={item}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
