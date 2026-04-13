import { Panel } from "@/components/panels/Panel";

interface OpportunitiesRisksPanelProps {
  opportunities: string[];
  risks: string[];
  openQuestions?: string[];
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

export function OpportunitiesRisksPanel({
  opportunities,
  risks,
  openQuestions = [],
}: OpportunitiesRisksPanelProps) {
  return (
    <Panel>
      <h3 className="text-lg font-semibold">Opportunities & Risks</h3>
      <div className="mt-5 grid gap-5 md:grid-cols-3">
        <ListBlock items={opportunities} title="Opportunities" />
        <ListBlock items={risks} title="Risks" />
        <ListBlock items={openQuestions} title="Open questions" />
      </div>
    </Panel>
  );
}
