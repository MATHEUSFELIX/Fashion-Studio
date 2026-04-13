import { useMemo, useState } from "react";
import { useModels } from "@/app/providers/modelContext";
import { useStudio } from "@/app/providers/studioContext";
import { routes } from "@/app/router/routes";
import { Panel } from "@/components/panels/Panel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { BriefIntelligencePanel } from "@/features/fashion-intelligence/components/BriefIntelligencePanel";
import { fashionPersonas } from "@/features/fashion-intelligence/personas/fashionPersonas";
import type { FashionPersona } from "@/features/fashion-intelligence/types/intelligence";
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

interface SimulationConfigDraft {
  rounds: number;
  enableAdvocatus: boolean;
  comparisonProvider: string;
  selectedPersonaIds: string[];
  customPersonas: FashionPersona[];
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
  const { registry } = useModels();
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
  const [simulationConfig, setSimulationConfig] = useState<SimulationConfigDraft>(() => ({
    rounds: 1,
    enableAdvocatus: false,
    comparisonProvider: "off",
    selectedPersonaIds: fashionPersonas.map((persona) => persona.id),
    customPersonas: [],
  }));
  const [showCustomAgent, setShowCustomAgent] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string>();

  const availableProviders = useMemo(() => {
    const providers = registry?.textModels.map((model) => model.provider) ?? ["openai", "gemini", "anthropic"];
    return Array.from(new Set(providers));
  }, [registry?.textModels]);
  const context = useMemo(() => buildContext(draft, simulationConfig), [draft, simulationConfig]);

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

  const launchSimulation = () => {
    saveAsCollection();
    setSavedMessage(
      `Simulação configurada com ${simulationConfig.selectedPersonaIds.length + simulationConfig.customPersonas.length}${
        simulationConfig.enableAdvocatus ? " + Advocatus Diaboli" : ""
      } perspectivas e ${simulationConfig.rounds} round(s). Clique em Run Intelligence para gerar a análise.`,
    );
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

            <SimulationControls
              availableProviders={availableProviders}
              config={simulationConfig}
              draft={draft}
              onChange={setSimulationConfig}
              onToggleCustomAgent={() => setShowCustomAgent((current) => !current)}
              showCustomAgent={showCustomAgent}
            />

            <Button className="w-full" onClick={saveAsCollection} type="button">
              Salvar como coleção ativa
            </Button>
            <Button className="w-full bg-[#f1c978] text-ink hover:bg-[#eabf69]" onClick={launchSimulation} type="button">
              Launch Simulation
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

function SimulationControls({
  availableProviders,
  config,
  draft,
  onChange,
  onToggleCustomAgent,
  showCustomAgent,
}: {
  availableProviders: string[];
  config: SimulationConfigDraft;
  draft: FashionIntelligenceDraft;
  onChange: (config: SimulationConfigDraft) => void;
  onToggleCustomAgent: () => void;
  showCustomAgent: boolean;
}) {
  const allPersonas = [...fashionPersonas, ...config.customPersonas];
  const activeCount =
    config.selectedPersonaIds.length + config.customPersonas.length + (config.enableAdvocatus ? 1 : 0);

  const togglePersona = (id: string) => {
    onChange({
      ...config,
      selectedPersonaIds: config.selectedPersonaIds.includes(id)
        ? config.selectedPersonaIds.filter((personaId) => personaId !== id)
        : [...config.selectedPersonaIds, id],
    });
  };

  const generateContextualAgents = () => {
    const generated: FashionPersona[] = [
      {
        id: `contextual_pricing_${Date.now()}`,
        name: "The Pricing Lead",
        role: "Price Architecture Reviewer",
        perspective: `Checks whether ${draft.priceRange || "the target price"} can support the idea commercially.`,
        systemPrompt: "Evaluate price architecture, perceived value, markdown risk, and SKU role.",
        color: "text-amber-700",
        bgColor: "bg-amber-50 border-amber-100",
        sentimentBias: -0.1,
      },
      {
        id: `contextual_channel_${Date.now()}`,
        name: "The Channel Lead",
        role: "Retail Channel Strategist",
        perspective: `Reads the concept through ${draft.retailer || "retail"} channel fit and launch execution.`,
        systemPrompt: "Evaluate channel fit, launch mechanics, store presentation, PDP clarity, and promotion pressure.",
        color: "text-cyan-700",
        bgColor: "bg-cyan-50 border-cyan-100",
        sentimentBias: 0.1,
      },
      {
        id: `contextual_culture_${Date.now()}`,
        name: "The Culture Reader",
        role: "Youth Culture Analyst",
        perspective: `Tests whether the idea feels credible for ${draft.targetAge || "the target audience"}.`,
        systemPrompt: "Evaluate cultural timing, social relevance, authenticity, age fit, and trend fatigue.",
        color: "text-fuchsia-700",
        bgColor: "bg-fuchsia-50 border-fuchsia-100",
        sentimentBias: 0.2,
      },
    ];
    onChange({
      ...config,
      customPersonas: [...config.customPersonas, ...generated],
      selectedPersonaIds: [...config.selectedPersonaIds, ...generated.map((persona) => persona.id)],
    });
  };

  const addCustomAgent = (persona: FashionPersona) => {
    onChange({
      ...config,
      customPersonas: [...config.customPersonas, persona],
      selectedPersonaIds: [...config.selectedPersonaIds, persona.id],
    });
  };

  return (
    <div className="space-y-6 border-t border-[#e7a6f1] pt-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-ink/45">Debate rounds</p>
        <div className="mt-3 flex items-center gap-3">
          <button
            className="h-9 w-9 rounded-md border border-ink/10 bg-white text-lg text-ink/45"
            onClick={() => onChange({ ...config, rounds: Math.max(1, config.rounds - 1) })}
            type="button"
          >
            -
          </button>
          <div className="flex-1 rounded-lg border border-ink/10 bg-white p-4 text-center">
            <p className="text-2xl font-semibold">{config.rounds}</p>
            <p className="mt-1 text-xs text-ink/45">
              {config.rounds === 1 ? "Opening positions only" : "Opening, challenge, and final recommendations"}
            </p>
          </div>
          <button
            className="h-9 w-9 rounded-md border border-ink/10 bg-white text-lg text-ink/45"
            onClick={() => onChange({ ...config, rounds: config.rounds + 1 })}
            type="button"
          >
            +
          </button>
        </div>
      </div>

      <button
        className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left transition ${
          config.enableAdvocatus ? "border-[#df72ef] bg-[#fff0ff]" : "border-ink/10 bg-white"
        }`}
        onClick={() => onChange({ ...config, enableAdvocatus: !config.enableAdvocatus })}
        type="button"
      >
        <span className="rounded-md bg-[#f3e3ff] px-2 py-1">☯</span>
        <span className="flex-1">
          <span className="block text-sm font-semibold">Advocatus Diaboli</span>
          <span className="text-xs text-ink/45">Adiciona uma perspectiva que sempre desafia o consenso emergente</span>
        </span>
        <span
          className={`h-4 w-4 rounded-full border-2 ${
            config.enableAdvocatus ? "border-[#c83be0] bg-[#c83be0]" : "border-ink/20"
          }`}
        />
      </button>

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-ink/45">A/B provider comparison</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <ChipButton
            active={config.comparisonProvider === "off"}
            label="Off"
            onClick={() => onChange({ ...config, comparisonProvider: "off" })}
          />
          {availableProviders.map((provider) => (
            <ChipButton
              active={config.comparisonProvider === provider}
              key={provider}
              label={providerLabel(provider)}
              onClick={() => onChange({ ...config, comparisonProvider: provider })}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-wider text-ink/45">Agents</p>
          <p className="text-xs font-semibold text-ink/60">{activeCount} active</p>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          {allPersonas.map((persona) => (
            <button
              className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${
                config.selectedPersonaIds.includes(persona.id)
                  ? "border-ink/15 bg-white shadow-sm"
                  : "border-ink/10 bg-white/50 opacity-60"
              }`}
              key={persona.id}
              onClick={() => togglePersona(persona.id)}
              type="button"
            >
              <span className="rounded-md border border-ink/10 bg-ink/5 px-2 py-1">{personaAvatar(persona.id)}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{persona.name}</span>
                <span className="block truncate text-xs text-ink/45">{persona.role}</span>
              </span>
              <span
                className={`h-4 w-4 rounded-full ${
                  config.selectedPersonaIds.includes(persona.id) ? "bg-[#f1a11b]" : "border border-ink/20"
                }`}
              />
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          <button
            className="block text-sm font-medium text-[#9f87ff] disabled:opacity-40"
            onClick={generateContextualAgents}
            type="button"
          >
            ✨ Generate 3 contextual agents with AI
          </button>
          <button className="block text-sm text-ink/55" onClick={onToggleCustomAgent} type="button">
            + Add custom agent manually
          </button>
          {showCustomAgent ? <CustomAgentBuilder onAdd={addCustomAgent} /> : null}
        </div>
      </div>
    </div>
  );
}

function CustomAgentBuilder({ onAdd }: { onAdd: (persona: FashionPersona) => void }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [perspective, setPerspective] = useState("");

  const add = () => {
    if (!name.trim() || !role.trim() || !perspective.trim()) return;
    onAdd({
      id: `custom_${Date.now()}`,
      name: name.trim(),
      role: role.trim(),
      perspective: perspective.trim(),
      systemPrompt: perspective.trim(),
      color: "text-ink",
      bgColor: "bg-white border-ink/10",
      sentimentBias: 0,
    });
    setName("");
    setRole("");
    setPerspective("");
  };

  return (
    <div className="rounded-lg border border-ink/10 bg-white p-4">
      <div className="grid gap-3">
        <input className={fieldClass} onChange={(event) => setName(event.target.value)} placeholder="Agent name" value={name} />
        <input className={fieldClass} onChange={(event) => setRole(event.target.value)} placeholder="Role" value={role} />
        <textarea
          className={`${fieldClass} min-h-20 resize-none`}
          onChange={(event) => setPerspective(event.target.value)}
          placeholder="Perspective and evaluation style"
          value={perspective}
        />
        <Button disabled={!name.trim() || !role.trim() || !perspective.trim()} onClick={add} type="button">
          Add Agent
        </Button>
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

function providerLabel(provider: string) {
  if (provider === "openai") return "OpenAI";
  if (provider === "gemini") return "Gemini";
  if (provider === "anthropic") return "Claude";
  if (provider === "ollama") return "Ollama";
  return provider;
}

function personaAvatar(id: string) {
  if (id.includes("forecaster")) return "🔮";
  if (id.includes("buyer")) return "🛒";
  if (id.includes("shopper")) return "🛍";
  if (id.includes("brand")) return "💎";
  if (id.includes("visual")) return "🎨";
  if (id.includes("production")) return "♧";
  if (id.includes("pricing")) return "$";
  if (id.includes("channel")) return "⌘";
  if (id.includes("culture")) return "✦";
  return "•";
}

function buildContext(
  draft: FashionIntelligenceDraft,
  simulationConfig: SimulationConfigDraft,
): { collection: CollectionPreset; brief: CollectionBrief } {
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
    `Simulation rounds: ${simulationConfig.rounds}.`,
    `Selected perspectives: ${simulationConfig.selectedPersonaIds.length + simulationConfig.customPersonas.length}.`,
    simulationConfig.enableAdvocatus ? "Include a devil's advocate stress-test perspective." : "",
    simulationConfig.comparisonProvider !== "off"
      ? `Compare the primary model against ${providerLabel(simulationConfig.comparisonProvider)}.`
      : "",
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
      `Use ${simulationConfig.rounds} round(s) of critique depth and ${
        simulationConfig.enableAdvocatus ? "include" : "do not include"
      } a dissenting stress-test lens.`,
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
