import { useParams } from "react-router-dom";
import { AssetCard } from "@/components/cards/AssetCard";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { Panel } from "@/components/panels/Panel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/services/api/mockApi";

const attributes = ["Neckline", "Sleeve", "Closure", "Pocket", "Measurement notes"];

export function TechnicalFlatPage() {
  const { designId = "" } = useParams();
  const flats = useAsync(() => api.listAssets("technical_flat", designId), [designId]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <AsyncBoundary {...flats}>
        {(data) => (
          <div className="grid gap-4 md:grid-cols-2">
            {data.length === 0 ? (
              <Panel>
                <Badge tone="ai">AI generation</Badge>
                <h2 className="mt-3 text-2xl font-semibold">Technical flat queued</h2>
                <p className="mt-2 text-ink/60">
                  A front/back technical view will appear here after generation.
                </p>
              </Panel>
            ) : (
              data.map((asset) => <AssetCard asset={asset} key={asset.id} />)
            )}
          </div>
        )}
      </AsyncBoundary>
      <Panel>
        <Badge tone="human">Human review</Badge>
        <h2 className="mt-3 text-2xl font-semibold">Technical attributes</h2>
        <div className="mt-5 space-y-3">
          {attributes.map((item) => (
            <label className="block" key={item}>
              <span className="text-sm font-semibold">{item}</span>
              <input className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2" />
            </label>
          ))}
        </div>
        <Button className="mt-5 w-full" type="button">
          Export technical pack
        </Button>
      </Panel>
    </div>
  );
}
