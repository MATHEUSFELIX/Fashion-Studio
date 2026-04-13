import { useParams } from "react-router-dom";
import { ActiveModelBadges } from "@/components/ai/ActiveModelBadges";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { Panel } from "@/components/panels/Panel";
import { Badge } from "@/components/ui/Badge";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/services/api/mockApi";

export function ScoringPage() {
  const { designId = "" } = useParams();
  const score = useAsync(() => api.scoreDesign(designId), [designId]);

  return (
    <AsyncBoundary {...score}>
      {(data) => (
        <div className="space-y-6">
          <Panel>
            <div className="flex flex-wrap gap-2">
              <Badge tone="system">System recommendation</Badge>
              <ActiveModelBadges />
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Scoring and recommendations</h2>
            <p className="mt-2 max-w-2xl text-ink/65">
              Creative, commercial, and operational scores are guidance for review, not automatic
              approval.
            </p>
          </Panel>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Creative", data.creative],
              ["Commercial", data.commercial],
              ["Operational", data.operational],
            ].map(([label, value]) => (
              <Panel key={label}>
                <p className="text-sm font-semibold uppercase text-ink/45">{label}</p>
                <p className="mt-4 text-5xl font-semibold">{value}</p>
              </Panel>
            ))}
          </div>
          <Panel>
            <h3 className="text-xl font-semibold">Recommendations</h3>
            <div className="mt-4 space-y-4">
              {data.recommendations.map((recommendation) => (
                <div className="border-t border-ink/10 pt-4" key={recommendation.id}>
                  <div className="flex flex-wrap gap-2">
                    <Badge tone="system">System recommendation</Badge>
                    <Badge>{recommendation.priority}</Badge>
                  </div>
                  <p className="mt-3 font-semibold">{recommendation.title}</p>
                  <p className="mt-1 text-sm text-ink/60">{recommendation.detail}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}
    </AsyncBoundary>
  );
}
