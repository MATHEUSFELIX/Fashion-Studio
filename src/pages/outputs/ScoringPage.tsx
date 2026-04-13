import { useParams } from "react-router-dom";
import { useStudio } from "@/app/providers/studioContext";
import { ActiveModelBadges } from "@/components/ai/ActiveModelBadges";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { Panel } from "@/components/panels/Panel";
import { Badge } from "@/components/ui/Badge";
import { DesignValidationPanel } from "@/features/fashion-intelligence/components/DesignValidationPanel";
import { getFallbackBrief } from "@/features/fashion-intelligence/services/briefFallback";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/services/api/mockApi";

export function ScoringPage() {
  const { designId = "" } = useParams();
  const { activeCollection, activeSku, getAssetsForSku } = useStudio();
  const score = useAsync(() => api.scoreDesign(designId), [designId]);
  const skuAssets = getAssetsForSku(activeSku?.id);
  const photoshootCount = skuAssets.filter((asset) => asset.kind === "photoshoot").length;
  const readiness = activeSku?.status === "master_approved" && photoshootCount > 0 ? 86 : 58;

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
              Review the active SKU, saved photoshoot assets, and export readiness before handoff.
            </p>
          </Panel>
          <Panel>
            <div className="grid gap-5 md:grid-cols-[220px_1fr]">
              {activeSku?.imageUrl ? (
                <img className="aspect-square w-full rounded-md object-cover" src={activeSku.imageUrl} alt="" />
              ) : (
                <div className="aspect-square rounded-md border border-dashed border-ink/20 bg-white/50" />
              )}
              <div>
                <Badge tone={activeSku?.status === "master_approved" ? "success" : "neutral"}>
                  {activeSku?.status === "master_approved" ? "Master approved" : "Needs master approval"}
                </Badge>
                <h3 className="mt-3 text-2xl font-semibold">{activeSku?.name ?? "No active SKU"}</h3>
                <p className="mt-2 text-sm text-ink/60">
                  Collection: {activeCollection.name}. Photoshoot assets saved: {photoshootCount}.
                </p>
                <p className="mt-4 whitespace-pre-wrap text-sm text-ink/70">
                  {activeSku?.summary ?? "Generate a SKU concept before final review."}
                </p>
              </div>
            </div>
          </Panel>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ["Creative", data.creative],
              ["Commercial", data.commercial],
              ["Export readiness", readiness],
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
          <DesignValidationPanel
            context={{
              collection: activeCollection,
              brief: activeCollection.brief ?? getFallbackBrief(activeCollection),
              sku: activeSku,
              assets: skuAssets,
            }}
          />
        </div>
      )}
    </AsyncBoundary>
  );
}
