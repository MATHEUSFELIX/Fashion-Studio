import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { routes } from "@/app/router/routes";
import { useStudio } from "@/app/providers/studioContext";
import { useModels } from "@/app/providers/modelContext";
import { DesignCard } from "@/components/cards/DesignCard";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { Panel } from "@/components/panels/Panel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAsync } from "@/hooks/useAsync";
import { aiApi } from "@/services/api/aiApi";
import { api } from "@/services/api/mockApi";
import type { CollectionBrief } from "@/types/domain/collectionPreset";

export function WorkspacePage() {
  const workspace = useAsync(api.getWorkspace, []);
  const { activeCollection, updateCollectionBrief } = useStudio();
  const { selectedTextModel } = useModels();
  const [isGeneratingBrief, setIsGeneratingBrief] = useState(false);
  const [briefError, setBriefError] = useState<string>();
  const [isEditingBrief, setIsEditingBrief] = useState(false);
  const [draftBrief, setDraftBrief] = useState<CollectionBrief>(() =>
    defaultBrief(activeCollection),
  );

  const brief = activeCollection.brief;

  useEffect(() => {
    setDraftBrief(brief ?? defaultBrief(activeCollection));
    setIsEditingBrief(false);
  }, [activeCollection.id, brief, activeCollection]);

  const generateBrief = async () => {
    if (!selectedTextModel) {
      setBriefError("Choose a working text model first.");
      return;
    }
    setIsGeneratingBrief(true);
    setBriefError(undefined);
    try {
      const result = await aiApi.generateText({
        model: selectedTextModel,
        instructions:
          "You are a senior kidswear creative director. Return only valid JSON. Do not wrap in markdown.",
        prompt: [
          "Generate a structured collection brief for a fashion studio.",
          `Name: ${activeCollection.name}`,
          `Age group: ${activeCollection.ageGroup}`,
          `Season: ${activeCollection.season}`,
          `Theme: ${activeCollection.theme}`,
          `Palette: ${activeCollection.palette}`,
          `Materials: ${activeCollection.materials}`,
          `Categories: ${activeCollection.categories.join(", ")}`,
          `Rules: ${activeCollection.rules}`,
          'Return JSON with keys: "concept" string, "keyDesignPrinciples" string array, "categories" array of objects with "name" and "details", "rulesApplied" string.',
        ].join("\n"),
      });
      const nextBrief = parseBrief(result.text, activeCollection);
      updateCollectionBrief(activeCollection.id, nextBrief);
      setDraftBrief(nextBrief);
      setIsEditingBrief(false);
    } catch (caught) {
      setBriefError(caught instanceof Error ? caught.message : "Brief generation failed.");
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  return (
    <AsyncBoundary {...workspace}>
      {(data) => (
        <div className="space-y-8">
          <section className="border-b border-ink/10 pb-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge tone="human">{activeCollection.ageGroup}</Badge>
                  <Badge>{activeCollection.season}</Badge>
                </div>
                <h2 className="mt-3 text-4xl font-medium tracking-tight">{activeCollection.name}</h2>
                <p className="mt-2 max-w-2xl text-sm font-medium text-ink/60">
                  Theme: {activeCollection.theme}
                </p>
              </div>
              <Button disabled={isGeneratingBrief} onClick={generateBrief} type="button">
                {isGeneratingBrief ? "Generating brief..." : brief ? "Regenerate AI Brief" : "Generate AI Brief"}
              </Button>
            </div>
            {briefError ? <p className="mt-4 text-sm font-semibold text-red-700">{briefError}</p> : null}
          </section>

          <section className="grid gap-6 lg:grid-cols-[1fr_0.7fr]">
            <Panel className="bg-white/70">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2 text-[#7d6758]">
                  <span className="text-lg">✦</span>
                  <h3 className="text-lg font-medium">Structured collection brief</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {isEditingBrief ? (
                    <>
                      <Button
                        onClick={() => {
                          updateCollectionBrief(activeCollection.id, draftBrief);
                          setIsEditingBrief(false);
                        }}
                        type="button"
                      >
                        Save brief
                      </Button>
                      <Button
                        onClick={() => {
                          setDraftBrief(brief ?? defaultBrief(activeCollection));
                          setIsEditingBrief(false);
                        }}
                        type="button"
                        variant="secondary"
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditingBrief(true)} type="button" variant="secondary">
                      Edit brief
                    </Button>
                  )}
                </div>
              </div>
              {isEditingBrief ? (
                <BriefEditor draft={draftBrief} onChange={setDraftBrief} />
              ) : (
                <BriefReadOnly brief={brief ?? defaultBrief(activeCollection)} />
              )}
            </Panel>

            <Panel>
              <h2 className="text-sm font-semibold uppercase text-ink/45">Jobs status</h2>
              <div className="mt-5 space-y-4">
                {data.jobs.map((job) => (
                  <div key={job.id}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold">{job.label}</p>
                      <Badge>{job.status}</Badge>
                    </div>
                    <div className="mt-2 h-2 rounded bg-ink/10">
                      <div
                        className="h-2 rounded bg-moss"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">Recent designs</h2>
                <p className="text-sm text-ink/60">Human briefs, AI generations, and approved concepts.</p>
              </div>
              <Link
                className="rounded-md px-4 py-2 text-sm font-semibold text-ink/70 transition hover:bg-ink/5 hover:text-ink"
                to={routes.createDesign}
              >
                New
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {data.recentDesigns.map((design) => (
                <DesignCard design={design} key={design.id} />
              ))}
            </div>
          </section>
        </div>
      )}
    </AsyncBoundary>
  );
}

function BriefReadOnly({ brief }: { brief: CollectionBrief }) {
  return (
    <div className="mt-6 space-y-7">
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-ink/45">Concept</h4>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink/75">
          {brief.concept}
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink/45">
            Key design principles
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-ink/75">
            {brief.keyDesignPrinciples.map((principle) => (
              <li key={principle}>{principle}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink/45">Categories</h4>
          <div className="mt-3 space-y-3">
            {brief.categories.map((category) => (
              <div className="rounded-md border border-ink/10 bg-ink/5 p-3" key={category.name}>
                <p className="text-xs font-semibold">{category.name}</p>
                <p className="mt-1 text-xs text-ink/55">{category.details}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-ink/45">Rules applied</h4>
        <p className="mt-2 whitespace-pre-wrap rounded-md bg-ink/5 p-3 text-sm text-ink/70">
          {brief.rulesApplied}
        </p>
      </div>
    </div>
  );
}

function BriefEditor({
  draft,
  onChange,
}: {
  draft: CollectionBrief;
  onChange: (brief: CollectionBrief) => void;
}) {
  return (
    <div className="mt-6 space-y-5">
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-ink/45">Concept</span>
        <textarea
          className="mt-2 min-h-32 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm"
          onChange={(event) => onChange({ ...draft, concept: event.target.value })}
          value={draft.concept}
        />
      </label>
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-ink/45">
          Key design principles
        </span>
        <textarea
          className="mt-2 min-h-32 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm"
          onChange={(event) =>
            onChange({
              ...draft,
              keyDesignPrinciples: event.target.value
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean),
            })
          }
          value={draft.keyDesignPrinciples.join("\n")}
        />
      </label>
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-ink/45">
          Categories
        </span>
        <p className="mt-1 text-xs text-ink/50">Use one line per category: name: details</p>
        <textarea
          className="mt-2 min-h-36 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm"
          onChange={(event) =>
            onChange({
              ...draft,
              categories: parseCategoryLines(event.target.value),
            })
          }
          value={draft.categories.map((category) => `${category.name}: ${category.details}`).join("\n")}
        />
      </label>
      <label className="block">
        <span className="text-xs font-bold uppercase tracking-wider text-ink/45">
          Rules applied
        </span>
        <textarea
          className="mt-2 min-h-24 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm"
          onChange={(event) => onChange({ ...draft, rulesApplied: event.target.value })}
          value={draft.rulesApplied}
        />
      </label>
    </div>
  );
}

function defaultBrief(activeCollection: {
  categories: string[];
  rules: string;
  materials: string;
  palette: string;
  ageGroup: string;
}): CollectionBrief {
  return {
    concept: `A premium minimalist line of soft everyday pieces for children, focused on ${activeCollection.materials}, ${activeCollection.palette}. Every generated image should read like a kidswear SKU or neutral catalog photoshoot.`,
    keyDesignPrinciples: [
      `Palette: ${activeCollection.palette}.`,
      `Materials: ${activeCollection.materials}.`,
      `Age group: ${activeCollection.ageGroup}.`,
      activeCollection.rules,
    ],
    categories: activeCollection.categories.map((category) => ({
      name: category,
      details: "Simple construction, soft hand feel, clean neutral presentation.",
    })),
    rulesApplied: activeCollection.rules,
  };
}

function parseCategoryLines(value: string): CollectionBrief["categories"] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, ...details] = line.split(":");
      return {
        name: name.trim(),
        details: details.join(":").trim() || "Defined by the edited brief.",
      };
    });
}

function parseBrief(text: string, activeCollection: { categories: string[]; rules: string }): CollectionBrief {
  const trimmed = text.trim();
  const jsonText = trimmed.match(/\{[\s\S]*\}/)?.[0] ?? trimmed;
  try {
    const parsed = JSON.parse(jsonText) as Partial<CollectionBrief>;
    return {
      concept: parsed.concept || "A focused kidswear collection brief generated from the active preset.",
      keyDesignPrinciples: Array.isArray(parsed.keyDesignPrinciples)
        ? parsed.keyDesignPrinciples
        : [activeCollection.rules],
      categories: Array.isArray(parsed.categories)
        ? parsed.categories.map((category) => ({
            name: String(category.name ?? "Category"),
            details: String(category.details ?? "Defined by the active preset."),
          }))
        : activeCollection.categories.map((category) => ({
            name: category,
            details: "Defined by the active preset.",
          })),
      rulesApplied: parsed.rulesApplied || activeCollection.rules,
    };
  } catch {
    return {
      concept: text,
      keyDesignPrinciples: [activeCollection.rules],
      categories: activeCollection.categories.map((category) => ({
        name: category,
        details: "Defined by the active preset.",
      })),
      rulesApplied: activeCollection.rules,
    };
  }
}
