import { useState } from "react";
import { AssetCard } from "@/components/cards/AssetCard";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { Panel } from "@/components/panels/Panel";
import { Button } from "@/components/ui/Button";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/services/api/mockApi";
import type { AssetType } from "@/types/domain/studio";

const filters: Array<"all" | AssetType> = ["all", "concept", "variation", "photoshoot", "technical_flat"];

export function AssetLibraryPage() {
  const [filter, setFilter] = useState<"all" | AssetType>("all");
  const assets = useAsync(
    () => api.listAssets(filter === "all" ? undefined : filter),
    [filter],
  );

  return (
    <div className="space-y-6">
      <Panel>
        <h2 className="text-3xl font-semibold tracking-tight">Asset library</h2>
        <p className="mt-2 text-ink/65">Generated and approved outputs stay searchable by type.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {filters.map((item) => (
            <Button
              key={item}
              onClick={() => setFilter(item)}
              type="button"
              variant={filter === item ? "primary" : "secondary"}
            >
              {item.replace("_", " ")}
            </Button>
          ))}
        </div>
      </Panel>
      <AsyncBoundary {...assets}>
        {(data) => (
          <div className="grid gap-4 md:grid-cols-3">
            {data.map((asset) => (
              <AssetCard asset={asset} key={asset.id} />
            ))}
          </div>
        )}
      </AsyncBoundary>
    </div>
  );
}
