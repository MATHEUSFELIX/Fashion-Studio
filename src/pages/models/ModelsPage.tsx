import { useModels } from "@/app/providers/modelContext";
import { Panel } from "@/components/panels/Panel";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { modelStorageId } from "@/services/ai/modelSelection";
import type { ModelKind, ModelOption } from "@/types/domain/models";
import { formatDate } from "@/utils/format";

export function ModelsPage() {
  const {
    registry,
    isLoading,
    selectedTextModel,
    selectedImageModel,
    selectTextModel,
    selectImageModel,
    refreshModels,
  } = useModels();

  return (
    <div className="space-y-6">
      <Panel>
        <Badge tone="system">Working models only</Badge>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Model selection</h2>
        <p className="mt-2 max-w-3xl text-ink/65">
          The menu lists providers that responded successfully from this environment. Models that
          fail discovery or are blocked by browser access stay hidden.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button disabled={isLoading} onClick={() => void refreshModels()} type="button">
            {isLoading ? "Checking..." : "Refresh models"}
          </Button>
          {registry ? (
            <p className="text-sm text-ink/55">Last check {formatDate(registry.checkedAt)}</p>
          ) : null}
        </div>
      </Panel>

      <div className="grid gap-5 lg:grid-cols-2">
        <ModelColumn
          kind="text"
          models={registry?.textModels ?? []}
          selected={selectedTextModel}
          onSelect={selectTextModel}
        />
        <ModelColumn
          kind="image"
          models={registry?.imageModels ?? []}
          selected={selectedImageModel}
          onSelect={selectImageModel}
        />
      </div>

      {registry?.errors.length ? (
        <Panel>
          <h3 className="text-lg font-semibold">Hidden providers</h3>
          <p className="mt-1 text-sm text-ink/60">
            These checks failed, so their models are not shown in the selectors.
          </p>
          <div className="mt-4 space-y-2">
            {registry.errors.map((error) => (
              <p className="rounded-md bg-ink/5 px-3 py-2 text-sm text-ink/65" key={error}>
                {error}
              </p>
            ))}
          </div>
        </Panel>
      ) : null}
    </div>
  );
}

function ModelColumn({
  kind,
  models,
  selected,
  onSelect,
}: {
  kind: ModelKind;
  models: ModelOption[];
  selected?: ModelOption;
  onSelect: (id: string) => void;
}) {
  return (
    <Panel>
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-semibold">{kind === "text" ? "Text models" : "Image models"}</h3>
        <Badge tone={models.length ? "success" : "neutral"}>{models.length} working</Badge>
      </div>
      <div className="mt-4 space-y-3">
        {models.length === 0 ? (
          <p className="text-sm text-ink/60">No working {kind} models were discovered.</p>
        ) : (
          models.map((model) => {
            const storageId = modelStorageId(model);
            const isSelected = selected ? modelStorageId(selected) === storageId : false;
            return (
              <button
                className={`w-full rounded-md border p-4 text-left transition ${
                  isSelected
                    ? "border-ink bg-ink text-paper"
                    : "border-ink/10 bg-white/70 hover:border-ink/30"
                }`}
                key={storageId}
                onClick={() => onSelect(storageId)}
                type="button"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={isSelected ? "system" : "success"}>Working</Badge>
                  <span className="text-xs font-semibold uppercase opacity-65">
                    {model.providerLabel}
                  </span>
                </div>
                <p className="mt-3 font-semibold">{model.name}</p>
                <p className={`mt-1 text-xs ${isSelected ? "text-paper/65" : "text-ink/50"}`}>
                  {model.id}
                </p>
              </button>
            );
          })
        )}
      </div>
    </Panel>
  );
}
