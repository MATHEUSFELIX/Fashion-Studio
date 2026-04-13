import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ActiveModelBadges } from "@/components/ai/ActiveModelBadges";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { SourceBadge } from "@/components/feedback/SourceBadge";
import { Panel } from "@/components/panels/Panel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/services/api/mockApi";

export function VariationsPage() {
  const { designId = "" } = useParams();
  const [filter, setFilter] = useState("all");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const variations = useAsync(() => api.listVariations(designId), [designId]);

  const toggleCompare = (id: string) => {
    setCompareIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const filtered = useMemo(() => {
    const list = variations.data ?? [];
    return filter === "all" ? list : list.filter((item) => item.status === filter);
  }, [filter, variations.data]);

  return (
    <AsyncBoundary {...variations} empty={filtered.length === 0}>
      {() => (
        <div className="space-y-6">
          <Panel>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone="ai">AI generation</Badge>
                  <ActiveModelBadges />
                </div>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight">Variation explorer</h2>
                <p className="mt-2 text-ink/65">Filter, compare, favorite, and approve generated options.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["all", "generated", "favorite", "approved"].map((item) => (
                  <Button
                    key={item}
                    onClick={() => setFilter(item)}
                    type="button"
                    variant={filter === item ? "primary" : "secondary"}
                  >
                    {item}
                  </Button>
                ))}
              </div>
            </div>
          </Panel>

          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="grid gap-4 md:grid-cols-3">
              {filtered.map((variation) => (
                <article
                  className="overflow-hidden rounded-lg border border-ink/10 bg-white/70"
                  key={variation.id}
                >
                  <img className="h-64 w-full object-cover" src={variation.image} alt="" />
                  <div className="space-y-3 p-4">
                    <div className="flex flex-wrap gap-2">
                      <SourceBadge source={variation.source} />
                      <Badge tone={variation.status === "approved" ? "success" : "neutral"}>
                        {variation.status}
                      </Badge>
                    </div>
                    <h3 className="font-semibold">{variation.title}</h3>
                    <p className="text-sm text-ink/60">
                      {variation.palette} / {variation.silhouette}
                    </p>
                    <div className="flex items-center justify-between">
                      <strong>{variation.score}</strong>
                      <Button
                        onClick={() => toggleCompare(variation.id)}
                        type="button"
                        variant={compareIds.includes(variation.id) ? "primary" : "secondary"}
                      >
                        Compare
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <Panel>
              <h3 className="text-lg font-semibold">Compare drawer</h3>
              <p className="mt-2 text-sm text-ink/60">Selected variations stay here for side-by-side review.</p>
              <div className="mt-4 space-y-3">
                {compareIds.length === 0 ? (
                  <p className="text-sm text-ink/45">No variations selected.</p>
                ) : (
                  compareIds.map((id) => <Badge key={id}>{id}</Badge>)
                )}
              </div>
              <Button className="mt-5 w-full" type="button" variant="secondary">
                Refine prompt
              </Button>
            </Panel>
          </div>
        </div>
      )}
    </AsyncBoundary>
  );
}
