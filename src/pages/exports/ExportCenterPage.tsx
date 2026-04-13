import { useEffect, useState } from "react";
import { ActiveModelBadges } from "@/components/ai/ActiveModelBadges";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { Panel } from "@/components/panels/Panel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/services/api/mockApi";
import { formatDate } from "@/utils/format";

export function ExportCenterPage() {
  const exports = useAsync(api.listExports, []);
  const [bundles, setBundles] = useState(exports.data ?? []);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (exports.data) {
      setBundles(exports.data);
    }
  }, [exports.data]);

  useEffect(() => {
    if (!bundles.some((bundle) => bundle.status === "processing")) {
      return;
    }
    const interval = window.setInterval(() => {
      api.listExports().then(setBundles);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [bundles]);

  const createExport = async () => {
    const bundle = await api.createExport({
      title: "Studio handoff bundle",
      design_id: "des_123",
      asset_ids: ["asset_1", "asset_2"],
      include_types: ["concept", "photoshoot", "technical_flat"],
    });
    setMessage(`${bundle.title} is processing.`);
    setBundles((current) => [bundle, ...current]);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Panel>
        <div className="flex flex-wrap gap-2">
          <Badge tone="human">Export setup</Badge>
          <ActiveModelBadges />
        </div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Export center</h2>
        <p className="mt-2 text-ink/65">Prepare concept, visual, and technical outputs for handoff.</p>
        <div className="mt-5 space-y-3">
          {["Concept render", "Photoshoot assets", "Technical flat", "Score summary"].map((item) => (
            <label className="flex items-center gap-3 text-sm" key={item}>
              <input defaultChecked type="checkbox" />
              {item}
            </label>
          ))}
        </div>
        <Button className="mt-5 w-full" onClick={createExport} type="button">
          Create export bundle
        </Button>
        {message ? <p className="mt-3 text-sm text-moss">{message}</p> : null}
      </Panel>
      <AsyncBoundary {...exports} data={bundles}>
        {() => (
          <div className="space-y-4">
            {bundles.map((bundle) => (
              <Panel key={bundle.id}>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">{bundle.title}</h3>
                    <p className="mt-1 text-sm text-ink/60">
                      {bundle.assetIds.length} assets / {formatDate(bundle.createdAt)}
                    </p>
                  </div>
                  <Badge tone={bundle.status === "complete" ? "success" : "neutral"}>
                    {bundle.status === "processing" ? "processing..." : "complete"}
                  </Badge>
                </div>
              </Panel>
            ))}
          </div>
        )}
      </AsyncBoundary>
    </div>
  );
}
