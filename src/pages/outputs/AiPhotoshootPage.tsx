import { useMemo, useState } from "react";
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

export function AiPhotoshootPage() {
  const { designId = "" } = useParams();
  const { selectedImageModel } = useModels();
  const { activeCollection } = useStudio();
  const [selectedShotIds, setSelectedShotIds] = useState<string[]>(defaultSelected);
  const [generated, setGenerated] = useState<GenerateImageResponse[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>();
  const assets = useAsync(() => api.listAssets("photoshoot", designId), [designId]);

  const selectedShots = useMemo(
    () =>
      shotGroups.flatMap((group) =>
        group.shots
          .filter((shot) => selectedShotIds.includes(shot.id))
          .map((shot) => ({ ...shot, category: group.category })),
      ),
    [selectedShotIds],
  );

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
        identityLock:
          `Same child model across the entire photoshoot: ${activeCollection.ageGroup}, soft natural expression, same face, same hair, same skin tone, same body proportions.`,
        outfitLock:
          `Exact same Loom & Spool outfit from collection ${activeCollection.name} across every generated image. Theme: ${activeCollection.theme}. Palette: ${activeCollection.palette}. Materials: ${activeCollection.materials}. Rules: ${activeCollection.rules}. No logo, no print changes, no color changes, no silhouette changes.`,
        shots: selectedShots,
      });
      setGenerated(result.images);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Photoshoot generation failed.");
    } finally {
      setIsGenerating(false);
    }
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
          </div>
          <Button disabled={isGenerating} onClick={generatePhotoshoot} type="button">
            {isGenerating ? "Generating selected shots..." : `Generate ${selectedShots.length} shots`}
          </Button>
        </div>
        {error ? <p className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}
      </Panel>

      <Panel>
        <div className="space-y-5">
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
