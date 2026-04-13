import { useMemo, useState } from "react";
import { useStudio } from "@/app/providers/studioContext";
import { routes } from "@/app/router/routes";
import { Panel } from "@/components/panels/Panel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BriefIntelligencePanel } from "@/features/fashion-intelligence/components/BriefIntelligencePanel";
import type { CollectionBrief, CollectionPreset } from "@/types/domain/collectionPreset";

type FashionGoal = "evaluate" | "discover_license" | "discover_own";
type CollectionType = "own" | "licensed";

interface FashionIntelligenceDraft {
  goal: FashionGoal;
  collectionType: CollectionType;
  collectionName: string;
  licensedBrand: string;
  retailer: string;
  targetAge: string;
  targetGender: string;
  season: string;
  priceRange: string;
  styleContext: string;
  decliningItem: string;
  decliningReason: string;
}

const goals: Array<{ id: FashionGoal; icon: string; label: string; desc: string }> = [
  {
    id: "evaluate",
    icon: "☆",
    label: "Avaliar nova coleção",
    desc: "Analise uma coleção ou licenciado antes de lançar",
  },
  {
    id: "discover_license",
    icon: "⌕",
    label: "Descobrir próximo licenciado",
    desc: "Meu licenciado atual está perdendo força, qual escolher?",
  },
  {
    id: "discover_own",
    icon: "↘",
    label: "Renovar coleção própria",
    desc: "Minha linha está caindo, que direção tomar?",
  },
];

const retailers = ["Renner", "Riachuelo", "C&A", "Marisa", "Hering", "Arezzo", "Zara Brasil", "Outra"];
const genders = ["Feminino", "Masculino", "Unissex", "Infantil"];
const seasons = ["Verão 2026", "Inverno 2026", "Verão 2027", "Inverno 2027", "Cápsula / Atemporal"];
const prices = ["Popular (< R$80)", "Acessível (R$80-150)", "Médio (R$150-300)", "Médio-alto (R$300+)"];

const fieldClass = "mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm";

export function FashionIntelligencePage() {
  const { activeCollection, addCollection, setActiveCollectionId } = useStudio();
  const [draft, setDraft] = useState<FashionIntelligenceDraft>(() => ({
    goal: "evaluate",
    collectionType: "own",
    collectionName: activeCollection.name,
    licensedBrand: "",
    retailer: "Renner",
    targetAge: activeCollection.ageGroup,
    targetGender: "Infantil",
    season: activeCollection.season,
    priceRange: "Acessível (R$80-150)",
    styleContext: [
      activeCollection.theme,
      `Palette: ${activeCollection.palette}`,
      `Materials: ${activeCollection.materials}`,
      `Rules: ${activeCollection.rules}`,
    ].join("\n"),
    decliningItem: "",
    decliningReason: "",
  }));
  const [savedMessage, setSavedMessage] = useState<string>();

  const context = useMemo(() => buildContext(draft), [draft]);

  const saveAsCollection = () => {
    const collection = addCollection({
      name: context.collection.name,
      ageGroup: context.collection.ageGroup,
      theme: context.collection.theme,
      season: context.collection.season,
      rules: context.collection.rules,
      categories: context.collection.categories,
      palette: context.collection.palette,
      materials: context.collection.materials,
      brief: context.brief,
    });
    setActiveCollectionId(collection.id);
    setSavedMessage(`${collection.name} foi salva e definida como coleção ativa.`);
  };

  return (
    <div className="space-y-6">
      <Panel className="border-[#e7a6f1] bg-[#fff6ff]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge tone="ai">Fashion Intelligence</Badge>
              <Badge tone="system">Collection strategy</Badge>
            </div>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">Fashion Intelligence</h2>
            <p className="mt-2 max-w-2xl text-sm text-ink/60">
              Estruture a pergunta de moda, salve como coleção ativa e rode benchmark, audiência simulada, riscos e score.
            </p>
          </div>
          <a
            className="rounded-md border border-ink/15 bg-white/70 px-4 py-2 text-sm font-semibold text-ink/70 transition hover:bg-white"
            href={routes.workspace}
          >
            Voltar ao brief
          </a>
        </div>
      </Panel>

      <div className="grid gap-6 xl:grid-cols-[430px_1fr]">
        <Panel className="border-[#e7a6f1] bg-[#fff8ff]">
          <div className="mb-5 flex items-center gap-2 text-[#b526ce]">
            <span className="text-sm">▰</span>
            <h3 className="text-sm font-bold uppercase tracking-wider">Fashion Intelligence</h3>
          </div>

          <div className="space-y-6">
            <GoalSelector
              onChange={(goal) => setDraft((current) => ({ ...current, goal }))}
              value={draft.goal}
            />

            {draft.goal === "evaluate" ? (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink/45">
                  Tipo de coleção
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <ChipButton
                    active={draft.collectionType === "own"}
                    label="Coleção Própria"
                    onClick={() => setDraft((current) => ({ ...current, collectionType: "own" }))}
                  />
                  <ChipButton
                    active={draft.collectionType === "licensed"}
                    label="Licenciado"
                    onClick={() => setDraft((current) => ({ ...current, collectionType: "licensed" }))}
                  />
                </div>
              </div>
            ) : null}

            {draft.goal === "evaluate" ? (
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-ink/45">
                  {draft.collectionType === "licensed" ? "Nome do licenciado" : "Nome da coleção"} *
                </span>
                <input
                  className={fieldClass}
                  onChange={(event) =>
                    setDraft((current) =>
                      current.collectionType === "licensed"
                        ? { ...current, licensedBrand: event.target.value }
                        : { ...current, collectionName: event.target.value },
                    )
                  }
                  placeholder={
                    draft.collectionType === "licensed"
                      ? "ex: NASA, Disney, Marvel..."
                      : "ex: Coleção Y2K Revival, Terra & Mar..."
                  }
                  value={draft.collectionType === "licensed" ? draft.licensedBrand : draft.collectionName}
                />
              </label>
            ) : (
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-ink/45">
                  {draft.goal === "discover_license"
                    ? "Qual licenciado está parando de vender?"
                    : "Qual coleção está caindo?"}{" "}
                  *
                </span>
                <input
                  className={fieldClass}
                  onChange={(event) => setDraft((current) => ({ ...current, decliningItem: event.target.value }))}
                  placeholder={
                    draft.goal === "discover_license"
                      ? "ex: Sonic the Hedgehog, Power Rangers..."
                      : "ex: Coleção floral verão 25..."
                  }
                  value={draft.decliningItem}
                />
              </label>
            )}

            {draft.goal !== "evaluate" ? (
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-ink/45">
                  Por que está caindo?
                </span>
                <textarea
                  className={`${fieldClass} min-h-24 resize-none`}
                  onChange={(event) => setDraft((current) => ({ ...current, decliningReason: event.target.value }))}
                  placeholder="ex: Sell-through caiu, estoque acumulou, hype reduziu, concorrente entrou mais barato..."
                  value={draft.decliningReason}
                />
              </label>
            ) : null}

            <ChipGroup
              label="Varejista *"
              onChange={(retailer) => setDraft((current) => ({ ...current, retailer }))}
              options={retailers}
              value={draft.retailer}
            />

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-ink/45">Público - idade</span>
                <input
                  className={fieldClass}
                  onChange={(event) => setDraft((current) => ({ ...current, targetAge: event.target.value }))}
                  placeholder="ex: 6-12, 18-25, 35+"
                  value={draft.targetAge}
                />
              </label>
              <ChipGroup
                label="Público - gênero"
                onChange={(targetGender) => setDraft((current) => ({ ...current, targetGender }))}
                options={genders}
                value={draft.targetGender}
              />
            </div>

            <ChipGroup
              label="Estação"
              onChange={(season) => setDraft((current) => ({ ...current, season }))}
              options={seasons}
              value={draft.season}
            />
            <ChipGroup
              label="Faixa de preço"
              onChange={(priceRange) => setDraft((current) => ({ ...current, priceRange }))}
              options={prices}
              value={draft.priceRange}
            />

            <label className="block">
              <span className="text-xs font-bold uppercase tracking-wider text-ink/45">
                Referências de estilo & contexto *
              </span>
              <textarea
                className={`${fieldClass} min-h-36 resize-none`}
                onChange={(event) => setDraft((current) => ({ ...current, styleContext: event.target.value }))}
                placeholder="Proposta da coleção, tendências, peças-chave, paleta, materiais..."
                value={draft.styleContext}
              />
            </label>

            <Button className="w-full" onClick={saveAsCollection} type="button">
              Salvar como coleção ativa
            </Button>
            {savedMessage ? <p className="text-sm font-semibold text-moss">{savedMessage}</p> : null}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel>
            <div className="flex flex-wrap gap-2">
              <Badge tone="human">{context.collection.ageGroup}</Badge>
              <Badge>{context.collection.season}</Badge>
              <Badge tone="system">{draft.priceRange}</Badge>
            </div>
            <h3 className="mt-3 text-3xl font-semibold tracking-tight">{context.collection.name}</h3>
            <p className="mt-2 text-sm text-ink/60">Theme: {context.collection.theme}</p>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-ink/70">
              {context.brief.concept}
            </p>
          </Panel>

          <BriefIntelligencePanel context={context} />
        </div>
      </div>
    </div>
  );
}

function GoalSelector({
  value,
  onChange,
}: {
  value: FashionGoal;
  onChange: (goal: FashionGoal) => void;
}) {
  return (
    <div className="space-y-2">
      {goals.map((goal) => (
        <button
          className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition ${
            value === goal.id
              ? "border-[#df72ef] bg-[#fff0ff] text-[#a526ba]"
              : "border-ink/10 bg-white text-ink/60 hover:border-[#df72ef]"
          }`}
          key={goal.id}
          onClick={() => onChange(goal.id)}
          type="button"
        >
          <span className={`mt-0.5 rounded-md px-2 py-1 ${value === goal.id ? "bg-white/70" : "bg-ink/5"}`}>
            {goal.icon}
          </span>
          <span className="flex-1">
            <span className="block text-sm font-semibold">{goal.label}</span>
            <span className="mt-1 block text-xs text-ink/45">{goal.desc}</span>
          </span>
          <span
            className={`mt-1 h-4 w-4 rounded-full border-2 ${
              value === goal.id ? "border-[#c83be0] bg-[#c83be0]" : "border-ink/20"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

function ChipGroup({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-ink/45">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => (
          <ChipButton
            active={value === option}
            key={option}
            label={option}
            onClick={() => onChange(option)}
          />
        ))}
      </div>
    </div>
  );
}

function ChipButton({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      className={`rounded-md border px-3 py-2 text-sm font-medium transition ${
        active
          ? "border-[#df72ef] bg-[#fff0ff] text-[#a526ba]"
          : "border-ink/10 bg-white text-ink/60 hover:border-ink/20"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function buildContext(draft: FashionIntelligenceDraft): { collection: CollectionPreset; brief: CollectionBrief } {
  const isLicensed = draft.collectionType === "licensed" || draft.goal === "discover_license";
  const name =
    draft.goal === "evaluate"
      ? isLicensed
        ? draft.licensedBrand || "New Licensed Collection"
        : draft.collectionName || "New Own Collection"
      : draft.decliningItem || (draft.goal === "discover_license" ? "Licensed Discovery" : "Own Collection Renewal");
  const theme =
    draft.goal === "discover_license"
      ? "Licensed replacement discovery"
      : draft.goal === "discover_own"
        ? "Own collection renewal"
        : isLicensed
          ? "Licensed collection evaluation"
          : "Own collection evaluation";
  const categories = ["t-shirt", "pajama", "socks"];
  const rules = [
    `Retailer: ${draft.retailer || "not specified"}.`,
    `Target: ${draft.targetAge || "not specified"}, ${draft.targetGender || "not specified"}.`,
    `Price range: ${draft.priceRange || "not specified"}.`,
    draft.goal !== "evaluate" && draft.decliningReason
      ? `Decline context: ${draft.decliningReason}.`
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  const brief: CollectionBrief = {
    concept:
      draft.goal === "evaluate"
        ? `${isLicensed ? "Licensed" : "Own"} collection evaluation for ${name}. ${draft.styleContext}`
        : `${theme} for ${name}. ${draft.styleContext}`,
    keyDesignPrinciples: [
      `Use ${draft.retailer || "retail"} commercial reality as the benchmark.`,
      `Audience: ${draft.targetAge || "not specified"}, ${draft.targetGender || "not specified"}.`,
      `Season: ${draft.season || "not specified"}.`,
      `Price: ${draft.priceRange || "not specified"}.`,
    ],
    categories: categories.map((category) => ({
      name: category,
      details: "Evaluate fit, commercial clarity, styling potential, and production practicality.",
    })),
    rulesApplied: rules,
  };

  return {
    collection: {
      id: `fashion-intelligence-draft-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name,
      ageGroup: draft.targetAge || "Audience TBD",
      theme,
      season: draft.season || "Season TBD",
      rules,
      categories,
      palette: "defined by intelligence brief",
      materials: "defined by intelligence brief",
      brief,
    },
    brief,
  };
}
