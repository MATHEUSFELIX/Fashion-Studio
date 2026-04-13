import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from "@/app/router/routes";
import { ActiveModelBadges } from "@/components/ai/ActiveModelBadges";
import { Panel } from "@/components/panels/Panel";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useModels } from "@/app/providers/modelContext";
import { useStudio } from "@/app/providers/studioContext";
import { aiApi } from "@/services/api/aiApi";
import { api } from "@/services/api/mockApi";
import type { CreateDesignRequest } from "@/types/api/contracts";

const initialForm: CreateDesignRequest = {
  title: "Autumn Neutrals T-Shirt",
  prompt: "minimalist kids basic t-shirt, organic cotton jersey, oversized relaxed fit, no graphics, soft sage and ecru palette",
  category: "t-shirt",
  target_audience: "kids",
  collection_id: "col_123",
  reference_asset_ids: ["asset_1"],
  input_type: "sketch",
};

export function CreateDesignPage() {
  const [form, setForm] = useState<CreateDesignRequest>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>();
  const [generatedText, setGeneratedText] = useState<string>();
  const [error, setError] = useState<string>();
  const { selectedTextModel, selectedImageModel } = useModels();
  const { activeCollection } = useStudio();
  const navigate = useNavigate();

  useEffect(() => {
    setForm((current) => {
      if (activeCollection.categories.includes(current.category)) {
        return current;
      }
      return {
        ...current,
        category: activeCollection.categories[0] ?? current.category,
        collection_id: activeCollection.id,
      };
    });
  }, [activeCollection]);

  const update = (field: keyof CreateDesignRequest, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(undefined);
    try {
      const textPrompt = [
        `Create a structured fashion SKU brief for: ${form.title}.`,
        `Brief: ${form.prompt}`,
        `Collection: ${activeCollection.name}. Theme: ${activeCollection.theme}.`,
        `Category: ${form.category}. Audience: ${form.target_audience}, ${activeCollection.ageGroup}.`,
        `Brand preset: Loom & Spool kids studio. Season: ${activeCollection.season}. Palette: ${activeCollection.palette}. Materials: ${activeCollection.materials}. Rules: ${activeCollection.rules}.`,
        "Return JSON-like sections: concept, fabric, silhouette, color palette, construction notes, what the image must show.",
      ].join("\n");
      const imagePrompt = [
        `Single kidswear product concept render for Loom & Spool collection ${activeCollection.name}.`,
        `Garment category: ${form.category}.`,
        `Target: children ${activeCollection.ageGroup}, premium minimalist kidswear.`,
        `Theme: ${activeCollection.theme}.`,
        form.prompt,
        `Palette: ${activeCollection.palette}. Materials: ${activeCollection.materials}.`,
        `Collection rules: ${activeCollection.rules}.`,
        "Show the garment as a clean e-commerce SKU render on a neutral warm white studio background.",
        "No adult model, no runway, no streetwear logo, no text, no brand mark, no loud print, no fantasy costume, no unrelated objects.",
      ].join(" ");

      const [textResult, imageResult] = await Promise.all([
        selectedTextModel
          ? aiApi.generateText({
              model: selectedTextModel,
              instructions:
                "You are a fashion design director. Keep output useful for product development.",
              prompt: textPrompt,
            })
          : Promise.resolve(undefined),
        selectedImageModel
          ? aiApi.generateImage({
              model: selectedImageModel,
              prompt: imagePrompt,
            })
          : Promise.resolve(undefined),
      ]);

      setGeneratedText(textResult?.text);
      setGeneratedImage(imageResult?.imageUrl);
      const response = await api.createDesign(form, {
        imageUrl: imageResult?.imageUrl,
        summary: textResult?.text,
      });
      navigate(routes.designDetail(response.design_id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Generation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <Panel>
        <div className="flex flex-wrap gap-2">
          <Badge tone="human">Human input</Badge>
          <ActiveModelBadges />
        </div>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight">Create design</h2>
        <p className="mt-3 text-ink/65">
          Generating for {activeCollection.name}. The active preset controls palette, material,
          category rules, and image direction.
        </p>
        <div className="mt-6 rounded-lg border border-dashed border-ink/20 bg-white/50 p-6">
          <p className="text-sm font-semibold">Input preview</p>
          <p className="mt-2 text-sm text-ink/60">
            Sketch, reference image, or existing asset will attach here when the real uploader is
            connected.
          </p>
          {generatedImage ? (
            <img className="mt-4 rounded-md object-cover" src={generatedImage} alt="" />
          ) : null}
          {generatedText ? <p className="mt-4 text-sm text-ink/70">{generatedText}</p> : null}
          {error ? <p className="mt-4 text-sm font-semibold text-red-700">{error}</p> : null}
        </div>
      </Panel>

      <Panel>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-semibold">Title</span>
            <input
              className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2"
              onChange={(event) => update("title", event.target.value)}
              value={form.title}
            />
          </label>
          <label className="block">
            <span className="text-sm font-semibold">Brief prompt</span>
            <textarea
              className="mt-2 min-h-32 w-full rounded-md border border-ink/15 bg-white px-3 py-2"
              onChange={(event) => update("prompt", event.target.value)}
              value={form.prompt}
            />
          </label>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="block">
              <span className="text-sm font-semibold">Input type</span>
              <select
                className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2"
                onChange={(event) => update("input_type", event.target.value)}
                value={form.input_type}
              >
                <option value="sketch">Sketch</option>
                <option value="prompt">Prompt</option>
                <option value="reference">Reference</option>
                <option value="asset">Asset</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold">Category</span>
              <select
                className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2"
                onChange={(event) => update("category", event.target.value)}
                value={form.category}
              >
                {activeCollection.categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-semibold">Audience</span>
              <input
                className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2"
                onChange={(event) => update("target_audience", event.target.value)}
                value={form.target_audience}
              />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-semibold">Collection ID</span>
            <input
              className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2"
              onChange={(event) => update("collection_id", event.target.value)}
              value={form.collection_id}
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <Button disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Submit generation"}</Button>
            <Button type="button" variant="secondary">
              Save draft
            </Button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
