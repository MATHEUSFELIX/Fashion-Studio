import { useEffect, useMemo, useState } from "react";
import { useStudio } from "@/app/providers/studioContext";
import { Panel } from "@/components/panels/Panel";
import { Badge } from "@/components/ui/Badge";
import { TechnicalValidationPanel } from "@/features/fashion-intelligence/components/TechnicalValidationPanel";
import { getFallbackBrief } from "@/features/fashion-intelligence/services/briefFallback";

const fields = [
  "Neckline",
  "Sleeve",
  "Closure",
  "Pocket",
  "Material composition",
  "Measurements",
  "Care instructions",
  "Fit notes",
];

function storageKey(skuId?: string) {
  return `studio-design-os:technical-validation-fields:${skuId ?? "no-sku"}`;
}

function readFields(skuId?: string) {
  try {
    const raw = window.localStorage.getItem(storageKey(skuId));
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export function TechnicalValidationPage() {
  const { activeCollection, activeSku, getAssetsForSku } = useStudio();
  const skuAssets = getAssetsForSku(activeSku?.id);
  const technicalAssets = skuAssets.filter((asset) => asset.kind === "technical_flat");
  const [technicalNotes, setTechnicalNotes] = useState<Record<string, string>>(() =>
    readFields(activeSku?.id),
  );

  useEffect(() => {
    setTechnicalNotes(readFields(activeSku?.id));
  }, [activeSku?.id]);

  useEffect(() => {
    window.localStorage.setItem(storageKey(activeSku?.id), JSON.stringify(technicalNotes));
  }, [activeSku?.id, technicalNotes]);

  const context = useMemo(
    () => ({
      collection: activeCollection,
      brief: activeCollection.brief ?? getFallbackBrief(activeCollection),
      sku: activeSku,
      technicalNotes,
      technicalAssets,
    }),
    [activeCollection, activeSku, technicalAssets, technicalNotes],
  );

  return (
    <div className="space-y-6">
      <Panel>
        <div className="flex flex-wrap gap-2">
          <Badge tone="human">Technical sheet</Badge>
          <Badge tone={activeSku ? "success" : "system"}>{activeSku ? activeSku.name : "No active SKU"}</Badge>
        </div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Technical Validation</h2>
        <p className="mt-2 max-w-2xl text-ink/65">
          Complete or edit the technical fields, then run an operational validation against the active design and brief.
        </p>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Panel>
          <h3 className="text-lg font-semibold">Technical fields</h3>
          <div className="mt-5 space-y-3">
            {fields.map((field) => (
              <label className="block" key={field}>
                <span className="text-sm font-semibold">{field}</span>
                <input
                  className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm"
                  onChange={(event) =>
                    setTechnicalNotes((current) => ({ ...current, [field]: event.target.value }))
                  }
                  value={technicalNotes[field] ?? ""}
                />
              </label>
            ))}
          </div>
        </Panel>

        <TechnicalValidationPanel context={context} />
      </div>
    </div>
  );
}
