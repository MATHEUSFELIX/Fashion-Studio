import { useEffect, useState } from "react";
import { useStudio } from "@/app/providers/studioContext";
import { ActiveModelBadges } from "@/components/ai/ActiveModelBadges";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { Panel } from "@/components/panels/Panel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/services/api/mockApi";
import type { CollectionPreset } from "@/types/domain/collectionPreset";
import type { ProductSku, StudioAsset } from "@/types/domain/collectionPreset";
import type { AssetType } from "@/types/domain/studio";
import { formatDate } from "@/utils/format";

type ExportIncludeKey = "conceptRender" | "photoshootAssets" | "technicalFlat" | "scoreSummary";

interface ExportPreview {
  included: Record<ExportIncludeKey, boolean>;
  masterSku?: ProductSku;
  assets: StudioAsset[];
  photoshoots: Array<{
    key: string;
    data: {
      images?: Array<{ imageUrl: string; shotId?: string }>;
      savedAt?: string;
    };
  }>;
}

const exportOptions: Array<{
  key: ExportIncludeKey;
  label: string;
  type: AssetType | "score";
}> = [
  { key: "conceptRender", label: "Concept render", type: "concept" },
  { key: "photoshootAssets", label: "Photoshoot assets", type: "photoshoot" },
  { key: "technicalFlat", label: "Technical flat", type: "technical_flat" },
  { key: "scoreSummary", label: "Score summary", type: "score" },
];

export function ExportCenterPage() {
  const exports = useAsync(api.listExports, []);
  const { activeCollection, activeSku, getAssetsForSku } = useStudio();
  const [bundles, setBundles] = useState(exports.data ?? []);
  const [message, setMessage] = useState("");
  const [previewBundleId, setPreviewBundleId] = useState<string>();
  const [included, setIncluded] = useState<Record<ExportIncludeKey, boolean>>({
    conceptRender: true,
    photoshootAssets: true,
    technicalFlat: true,
    scoreSummary: true,
  });

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

  const selectedTypes = exportOptions
    .filter((option) => included[option.key] && option.type !== "score")
    .map((option) => option.type as AssetType);
  const selectedCount = Object.values(included).filter(Boolean).length;
  const skuAssets = getAssetsForSku(activeSku?.id);

  const toggleIncluded = (key: ExportIncludeKey) => {
    setIncluded((current) => ({ ...current, [key]: !current[key] }));
  };

  const createExport = async () => {
    const bundle = await api.createExport({
      title: "Studio handoff bundle",
      design_id: "des_123",
      asset_ids: ["asset_1", "asset_2"],
      include_types: selectedTypes,
    });
    setMessage(`${bundle.title} is processing.`);
    setBundles((current) => [bundle, ...current]);
  };

  const buildBundlePayload = (bundleId: string) => {
    const photoshootKeys = Object.keys(window.localStorage).filter((key) =>
      key.startsWith(`studio-design-os:photoshoot:${activeCollection.id}:`),
    );
    const photoshoots = photoshootKeys.map((key) => ({
      key,
      data: JSON.parse(window.localStorage.getItem(key) ?? "{}"),
    }));
    const bundle = bundles.find((item) => item.id === bundleId);
    return {
      exportedAt: new Date().toISOString(),
      collection: activeCollection,
      masterSku: activeSku,
      bundle,
      included: {
        ...included,
      },
      photoshoots,
      assets: skuAssets,
      note:
        "This handoff is built from the active master SKU, selected export sections, saved photoshoot assets, and collection preset.",
    };
  };

  const downloadBundle = (bundleId: string) => {
    const payload = buildBundlePayload(bundleId);
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${activeCollection.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${bundleId}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const selectedPreview = previewBundleId ? buildBundlePayload(previewBundleId) : undefined;

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <Panel>
        <div className="flex flex-wrap gap-2">
          <Badge tone="human">Export setup</Badge>
          <ActiveModelBadges />
        </div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Export center</h2>
        <p className="mt-2 text-ink/65">Prepare concept, visual, and technical outputs for handoff.</p>
        {activeSku ? (
          <div className="mt-4 rounded-md bg-ink/5 p-3">
            <p className="text-xs font-semibold uppercase text-ink/45">Active master SKU</p>
            <p className="mt-1 text-sm font-semibold">{activeSku.name}</p>
            <p className="mt-1 text-xs text-ink/55">
              {skuAssets.length} saved assets connected to this SKU.
            </p>
          </div>
        ) : (
          <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">
            Generate a master SKU before exporting.
          </p>
        )}
        <div className="mt-5 space-y-3">
          {exportOptions.map((item) => (
            <label className="flex items-center gap-3 text-sm" key={item.key}>
              <input
                checked={included[item.key]}
                onChange={() => toggleIncluded(item.key)}
                type="checkbox"
              />
              {item.label}
            </label>
          ))}
        </div>
        <Button className="mt-5 w-full" disabled={!selectedCount || !activeSku} onClick={createExport} type="button">
          Create export bundle
        </Button>
        <p className="mt-3 text-xs text-ink/50">
          {selectedCount ? `${selectedCount} sections selected.` : "Select at least one section."}
        </p>
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
                {bundle.status === "complete" ? (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Button onClick={() => setPreviewBundleId(bundle.id)} type="button" variant="secondary">
                      Show on screen
                    </Button>
                    <Button onClick={() => downloadBundle(bundle.id)} type="button" variant="secondary">
                      Download bundle JSON
                    </Button>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-ink/55">
                    Preparing metadata, selected assets, photoshoot references, and preset details.
                  </p>
                )}
              </Panel>
            ))}
          </div>
        )}
      </AsyncBoundary>

      {selectedPreview ? (
        <Panel className="lg:col-span-2">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <Badge tone="success">Bundle preview</Badge>
              <h3 className="mt-3 text-2xl font-semibold">{selectedPreview.bundle?.title}</h3>
              <p className="mt-1 text-sm text-ink/60">
                {activeCollection.name} / exported {formatDate(selectedPreview.exportedAt)}
              </p>
              {selectedPreview.masterSku ? (
                <p className="mt-1 text-sm font-semibold text-ink/70">
                  Master SKU: {selectedPreview.masterSku.name}
                </p>
              ) : null}
            </div>
            <Button onClick={() => setPreviewBundleId(undefined)} type="button" variant="ghost">
              Close preview
            </Button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {Object.entries(selectedPreview.included).map(([key, value]) => (
              <div className="rounded-md bg-ink/5 p-3" key={key}>
                <p className="text-xs font-semibold uppercase text-ink/45">{key}</p>
                <p className="mt-1 text-sm">{value ? "Included" : "Skipped"}</p>
              </div>
            ))}
          </div>

          {selectedPreview.included.conceptRender ? (
            <div className="mt-6">
              <h4 className="text-lg font-semibold">Concept render package</h4>
              {selectedPreview.masterSku?.imageUrl ? (
                <img
                  className="mt-3 max-h-96 rounded-md object-contain"
                  src={selectedPreview.masterSku.imageUrl}
                  alt=""
                />
              ) : null}
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <PreviewMeta label="Collection" value={selectedPreview.collection.name} />
                <PreviewMeta label="Theme" value={selectedPreview.collection.theme} />
                <PreviewMeta label="Age group" value={selectedPreview.collection.ageGroup} />
                <PreviewMeta label="Palette" value={selectedPreview.collection.palette} />
                <PreviewMeta label="Materials" value={selectedPreview.collection.materials} />
                <PreviewMeta label="Categories" value={selectedPreview.collection.categories.join(", ")} />
              </div>
              <p className="mt-3 rounded-md bg-ink/5 p-3 text-sm text-ink/70">
                {selectedPreview.collection.rules}
              </p>
            </div>
          ) : null}

          {selectedPreview.included.photoshootAssets ? (
            <PhotoshootPreview preview={selectedPreview} />
          ) : null}

          {selectedPreview.included.technicalFlat ? (
            <TechnicalFlatPreview collection={selectedPreview.collection} />
          ) : null}

          {selectedPreview.included.scoreSummary ? (
            <ScoreSummaryPreview collection={selectedPreview.collection} />
          ) : null}

          <div className="mt-6">
            <h4 className="text-lg font-semibold">Manifest</h4>
            <pre className="mt-3 max-h-80 overflow-auto rounded-md bg-ink p-4 text-xs text-paper">
              {JSON.stringify(
                {
                  exportedAt: selectedPreview.exportedAt,
                  collection: selectedPreview.collection.name,
                  masterSku: selectedPreview.masterSku?.name,
                  bundle: selectedPreview.bundle,
                  included: selectedPreview.included,
                  assetCount: selectedPreview.assets.length,
                  photoshootCount: selectedPreview.photoshoots.reduce(
                    (total, item) =>
                      selectedPreview.included.photoshootAssets
                        ? total + (item.data.images?.length ?? 0)
                        : total,
                    0,
                  ),
                },
                null,
                2,
              )}
            </pre>
          </div>
        </Panel>
      ) : null}
    </div>
  );
}

function PreviewMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-ink/5 p-3">
      <p className="text-xs font-semibold uppercase text-ink/45">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}

function PhotoshootPreview({ preview }: { preview: ExportPreview }) {
  const studioAssetImages = preview.assets
    .filter((asset) => asset.kind === "photoshoot" && asset.imageUrl)
    .map((asset) => ({
      imageUrl: asset.imageUrl!,
      shotId: asset.title,
    }));
  const legacyImages = preview.photoshoots.flatMap((item) => item.data.images ?? []);
  const images = studioAssetImages.length ? studioAssetImages : legacyImages;

  return (
    <div className="mt-6">
      <h4 className="text-lg font-semibold">Photoshoot assets</h4>
      {images.length ? (
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          {images.map((image, index) => (
            <div className="rounded-lg border border-ink/10 bg-white/70 p-3" key={`${image.shotId}-${index}`}>
              <img className="aspect-[3/4] w-full rounded-md object-cover" src={image.imageUrl} alt="" />
              <p className="mt-2 text-xs font-semibold text-ink/60">{image.shotId ?? `shot-${index + 1}`}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-ink/60">
          No saved photoshoot images found for this collection in this browser.
        </p>
      )}
    </div>
  );
}

function TechnicalFlatPreview({
  collection,
}: {
  collection: CollectionPreset;
}) {
  const category = collection.categories[0] ?? "garment";
  return (
    <div className="mt-6">
      <h4 className="text-lg font-semibold">Technical flat</h4>
      <div className="mt-3 grid gap-3 md:grid-cols-4">
        <PreviewMeta label="Base category" value={category} />
        <PreviewMeta label="Front view" value="Included" />
        <PreviewMeta label="Back view" value="Included" />
        <PreviewMeta label="Materials" value={collection.materials} />
      </div>
      <div className="mt-3 rounded-md bg-white/70 p-4 text-sm text-ink/70">
        Technical notes: preserve garment proportions, show clean seams, neckline, sleeve length,
        hem, and construction details. Palette: {collection.palette}. Rules: {collection.rules}
      </div>
    </div>
  );
}

function ScoreSummaryPreview({
  collection,
}: {
  collection: CollectionPreset;
}) {
  const scores = [
    ["Creative fit", 92],
    ["Commercial clarity", 86],
    ["Production readiness", 78],
  ] as const;

  return (
    <div className="mt-6">
      <h4 className="text-lg font-semibold">Score summary</h4>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        {scores.map(([label, value]) => (
          <div className="rounded-md bg-ink/5 p-3" key={label}>
            <p className="text-xs font-semibold uppercase text-ink/45">{label}</p>
            <p className="mt-2 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 rounded-md bg-white/70 p-4 text-sm text-ink/70">
        Recommendation: keep the collection focused on {collection.categories.join(", ")} with{" "}
        {collection.materials}. Check that generated assets follow: {collection.rules}
      </p>
    </div>
  );
}
