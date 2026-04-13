import { useModels } from "@/app/providers/modelContext";
import { Panel } from "@/components/panels/Panel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { OpportunitiesRisksPanel } from "@/features/fashion-intelligence/components/OpportunitiesRisksPanel";
import { PersonaReactionCard } from "@/features/fashion-intelligence/components/PersonaReactionCard";
import { ScoreBreakdown } from "@/features/fashion-intelligence/components/ScoreBreakdown";
import { useBriefIntelligence } from "@/features/fashion-intelligence/hooks/useBriefIntelligence";
import type { BriefIntelligenceContext } from "@/features/fashion-intelligence/types/intelligence";

export function BriefIntelligencePanel({ context }: { context: BriefIntelligenceContext }) {
  const { selectedTextModel } = useModels();
  const { result, isLoading, error, run } = useBriefIntelligence(selectedTextModel, context);

  return (
    <div className="space-y-5">
      <Panel>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="ai">Fashion Intelligence</Badge>
              {result ? <Badge tone={result.source === "ai" ? "success" : "system"}>Saved result</Badge> : null}
            </div>
            <h3 className="mt-3 text-2xl font-semibold tracking-tight">Collection intelligence</h3>
            <p className="mt-2 max-w-2xl text-sm text-ink/60">
              Benchmark, audience reaction, opportunities, risks, and the first score for the active brief.
            </p>
            {result ? (
              <p className="mt-2 text-xs text-ink/45">
                Last run: {new Date(result.generatedAt).toLocaleString()}
              </p>
            ) : null}
          </div>
          <Button disabled={isLoading} onClick={run} type="button">
            {isLoading ? "Running Intelligence..." : result ? "Rerun Intelligence" : "Run Intelligence"}
          </Button>
        </div>
        {error ? <p className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}
      </Panel>

      {result ? (
        <>
          <Panel>
            <h3 className="text-lg font-semibold">Executive Summary</h3>
            <p className="mt-3 text-sm leading-relaxed text-ink/70">{result.executiveSummary}</p>
          </Panel>

          <ScoreBreakdown scores={result.briefScore} />

          <Panel>
            <h3 className="text-lg font-semibold">Benchmark Snapshot</h3>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <InsightList items={result.benchmarkSnapshot.similarDirections} title="Similar directions" />
              <InsightList items={result.benchmarkSnapshot.saturatedElements} title="Saturated elements" />
              <InsightList items={result.benchmarkSnapshot.whitespaceOpportunities} title="Whitespace opportunities" />
              <InsightList items={result.benchmarkSnapshot.differentiationIdeas} title="Differentiation ideas" />
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

          <OpportunitiesRisksPanel
            openQuestions={result.openQuestions}
            opportunities={result.opportunities}
            risks={result.risks}
          />

          <Panel>
            <h3 className="text-lg font-semibold">Next actions</h3>
            <ol className="mt-4 space-y-2 text-sm text-ink/70">
              {result.topNextActions.map((action, index) => (
                <li className="rounded-md bg-ink/5 p-3" key={action}>
                  {index + 1}. {action}
                </li>
              ))}
            </ol>
          </Panel>
        </>
      ) : null}
    </div>
  );
}

function InsightList({ title, items }: { title: string; items: string[] }) {
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
