import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useStudio } from "@/app/providers/studioContext";
import { useModels } from "@/app/providers/modelContext";
import { ActiveModelBadges } from "@/components/ai/ActiveModelBadges";
import { AssetCard } from "@/components/cards/AssetCard";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { Panel } from "@/components/panels/Panel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAsync } from "@/hooks/useAsync";
import {
  aiApi,
  type GenerateImageResponse,
  type GeneratePhotoshootShot,
} from "@/services/api/aiApi";
import { api } from "@/services/api/mockApi";

const shotGroups: Array<{
  category: string;
  shots: Array<Omit<GeneratePhotoshootShot, "category">>;
}> = [
  {
    category: "Technical",
    shots: [
      {
        id: "front-full-body",
        label: "Frente corpo inteiro",
        prompt:
          "Full body front view, standing straight, arms relaxed, neutral expression, garment fully visible from head to toe.",
      },
      {
        id: "back-full-body",
        label: "Costas corpo inteiro",
        prompt:
          "Full body back view, standing straight, garment back construction clearly visible from head to toe.",
      },
      {
        id: "side-profile",
        label: "Perfil lateral",
        prompt:
          "Full body side profile view, posture neutral, garment side seam and silhouette clearly visible.",
      },
    ],
  },
  {
    category: "Detail",
    shots: [
      {
        id: "detail-close",
        label: "Close de detalhes",
        prompt:
          "Close-up detail crop of fabric texture, neckline, seams, hem, buttons or trim while preserving exact outfit identity.",
      },
    ],
  },
  {
    category: "Behavior",
    shots: [
      {
        id: "movement",
        label: "Foto em movimento",
        prompt:
          "Natural movement shot, child walking or gently spinning, garment drape and comfort visible, same outfit.",
      },
      {
        id: "standing-sitting",
        label: "Em pé e sentada",
        prompt:
          "Two catalog poses in one clean composition: one standing pose and one seated pose, same child and same outfit.",
      },
    ],
  },
  {
    category: "Editorial",
    shots: [
      {
        id: "natural-editorial",
        label: "Pose natural editorial",
        prompt:
          "Editorial catalog pose, calm natural posture, premium kidswear mood, soft expression, same garment.",
      },
    ],
  },
  {
    category: "Styling",
    shots: [
      {
        id: "complete-styling",
        label: "Look com styling completo",
        prompt:
          "Complete styling look with minimal neutral accessories only if needed, outfit remains the hero and unchanged.",
      },
      {
        id: "clean-styling",
        label: "Look com styling limpo",
        prompt:
          "Clean styling with no accessories, simple catalog composition, outfit unchanged and fully readable.",
      },
    ],
  },
  {
    category: "Lighting",
    shots: [
      {
        id: "natural-light",
        label: "Luz natural",
        prompt:
          "Soft natural window light, warm neutral background, realistic skin and fabric, same child and same outfit.",
      },
    ],
  },
  {
    category: "Lifestyle",
    shots: [
      {
        id: "spontaneous",
        label: "Foto espontânea",
        prompt:
          "Spontaneous lifestyle catalog shot, candid but calm, child-safe setting, outfit unchanged and prominent.",
      },
    ],
  },
  {
    category: "Motion",
    shots: [
      {
        id: "short-video-sequence",
        label: "Vídeo curto / sequência",
        prompt:
          "Three-frame motion sequence layout showing subtle movement progression, same child and same outfit in each frame.",
      },
    ],
  },
];

const defaultSelected = ["front-full-body", "back-full-body", "detail-close", "natural-editorial"];

const photoshootStoragePrefix = "studio-design-os:photoshoot";

export function AiPhotoshootPage() {
  const { designId = "" } = useParams();
  const { selectedImageModel } = useModels();
  const { activeCollection, activeSku, addAsset, getAssetsForSku } = useStudio();
  const [selectedShotIds, setSelectedShotIds] = useState<string[]>(defaultSelected);
  const [personLock, setPersonLock] = useState(
    "Mesma menina em todas as fotos: aproximadamente 5 anos, cabelo castanho médio, expressão natural, mesmo rosto, mesmo tom de pele, mesmas proporções corporais.",
  );
  const [outfitLock, setOutfitLock] = useState(
    "Mesma roupa em todas as fotos: camiseta infantil de manga curta em algodão orgânico, cor ecru ou soft sage, modelagem relaxada, mesma gola, mesmas mangas curtas, mesma barra, sem trocar para manga longa, sem trocar a camiseta.",
  );
  const [generated, setGenerated] = useState<GenerateImageResponse[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>();
  const assets = useAsync(() => api.listAssets("photoshoot", designId), [designId]);
  const storageKey = `${photoshootStoragePrefix}:${activeCollection.id}:${designId}`;
  const savedSkuAssets = getAssetsForSku(activeSku?.id).filter((asset) => asset.kind === "photoshoot");

  const selectedShots = useMemo(
    () =>
      shotGroups.flatMap((group) =>
        group.shots
          .filter((shot) => selectedShotIds.includes(shot.id))
          .map((shot) => ({ ...shot, category: group.category })),
      ),
    [selectedShotIds],
  );

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) {
        setGenerated([]);
        return;
      }
      const saved = JSON.parse(raw) as {
        images?: GenerateImageResponse[];
        selectedShotIds?: string[];
        personLock?: string;
        outfitLock?: string;
      };
      setGenerated(saved.images ?? []);
      if (saved.selectedShotIds?.length) {
        setSelectedShotIds(saved.selectedShotIds);
      }
      if (saved.personLock) {
        setPersonLock(saved.personLock);
      }
      if (saved.outfitLock) {
        setOutfitLock(saved.outfitLock);
      }
    } catch {
      setGenerated([]);
    }
  }, [storageKey]);

  const savePhotoshoot = (images: GenerateImageResponse[]) => {
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        images,
        selectedShotIds,
        personLock,
        outfitLock,
        savedAt: new Date().toISOString(),
      }),
    );
  };

  const toggleShot = (id: string) => {
    setSelectedShotIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const generatePhotoshoot = async () => {
    if (!selectedImageModel) {
      setError("Choose a working image model first.");
      return;
    }
    if (!selectedShots.length) {
      setError("Select at least one photo type.");
      return;
    }
    setIsGenerating(true);
    setError(undefined);
    setGenerated([]);
    try {
      const result = await aiApi.generatePhotoshoot({
        model: selectedImageModel,
        identityLock: `${personLock} Collection age group: ${activeCollection.ageGroup}.`,
        outfitLock: `${outfitLock} Collection: ${activeCollection.name}. Theme: ${activeCollection.theme}. Palette: ${activeCollection.palette}. Materials: ${activeCollection.materials}. Rules: ${activeCollection.rules}.`,
        referenceImageUrl: activeSku?.imageUrl,
        shots: selectedShots,
      });
      setGenerated(result.images);
      savePhotoshoot(result.images);
      result.images.forEach((image) => {
        const shot = selectedShots.find((item) => item.id === image.shotId);
        addAsset({
          collectionId: activeCollection.id,
          skuId: activeSku?.id,
          kind: "photoshoot",
          title: shot?.label ?? image.shotId ?? "Photoshoot shot",
          imageUrl: image.imageUrl,
          payload: {
            shot,
            prompt: image.prompt,
            model: image.model,
            provider: image.provider,
          },
        });
      });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Photoshoot generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const clearPhotoshoot = () => {
    window.localStorage.removeItem(storageKey);
    setGenerated([]);
  };

  return (
    <div className="space-y-6">
      <Panel>
        <div className="flex flex-wrap gap-2">
          <Badge tone="ai">AI photoshoot</Badge>
          <ActiveModelBadges />
        </div>
        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Shot list</h2>
            <p className="mt-2 max-w-2xl text-ink/65">
              Select the images to create for {activeCollection.name}. The prompt locks the same
              child and outfit across all shots, changing only pose, angle, lighting, or style.
            </p>
            {activeSku ? (
              <p className="mt-2 text-sm font-semibold text-ink/70">
                Master SKU: {activeSku.name} / {activeSku.category}
              </p>
            ) : (
              <p className="mt-2 text-sm font-semibold text-red-700">
                Generate and approve a master SKU first for stronger consistency.
              </p>
            )}
          </div>
          <Button disabled={isGenerating} onClick={generatePhotoshoot} type="button">
            {isGenerating ? "Generating selected shots..." : `Generate ${selectedShots.length} shots`}
          </Button>
          {generated.length ? (
            <Button onClick={clearPhotoshoot} type="button" variant="secondary">
              Clear saved shots
            </Button>
          ) : null}
        </div>
        {error ? <p className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}
      </Panel>

      <Panel>
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-ink/45">
                Pessoa fixa
              </span>
              <textarea
                className="mt-2 min-h-28 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm"
                onChange={(event) => setPersonLock(event.target.value)}
                value={personLock}
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-ink/45">
                Roupa fixa
              </span>
              <textarea
                className="mt-2 min-h-28 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm"
                onChange={(event) => setOutfitLock(event.target.value)}
                value={outfitLock}
              />
            </label>
          </div>

          {shotGroups.map((group) => (
            <div key={group.category}>
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-ink/35">
                {group.category}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.shots.map((shot) => {
                  const isSelected = selectedShotIds.includes(shot.id);
                  return (
                    <button
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        isSelected
                          ? "border-[#7c9cff] bg-[#dfe8ff] text-[#2456e8]"
                          : "border-ink/10 bg-white text-ink/65 hover:border-[#7c9cff] hover:text-[#2456e8]"
                      }`}
                      key={shot.id}
                      onClick={() => toggleShot(shot.id)}
                      type="button"
                    >
                      {shot.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {generated.length ? (
        <section className="grid gap-4 md:grid-cols-2">
          {generated.map((image) => {
            const shot = selectedShots.find((item) => item.id === image.shotId);
            return (
              <Panel className="p-3" key={`${image.shotId}-${image.imageUrl.slice(0, 24)}`}>
                <img
                  className="aspect-[3/4] w-full rounded-md object-cover"
                  src={image.imageUrl}
                  alt=""
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge tone="success">{shot?.label ?? image.shotId}</Badge>
                  <Badge>{shot?.category}</Badge>
                </div>
              </Panel>
            );
          })}
        </section>
      ) : null}

      {savedSkuAssets.length ? (
        <Panel>
          <h3 className="text-lg font-semibold">Saved SKU photoshoot assets</h3>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            {savedSkuAssets.map((asset) => (
              <div className="rounded-lg border border-ink/10 bg-white/70 p-3" key={asset.id}>
                {asset.imageUrl ? (
                  <img className="aspect-[3/4] w-full rounded-md object-cover" src={asset.imageUrl} alt="" />
                ) : null}
                <p className="mt-2 text-xs font-semibold text-ink/60">{asset.title}</p>
              </div>
            ))}
          </div>
        </Panel>
      ) : null}

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
