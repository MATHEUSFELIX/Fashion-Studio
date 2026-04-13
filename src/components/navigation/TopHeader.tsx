import { LinkButton } from "@/components/ui/LinkButton";
import { routes } from "@/app/router/routes";
import { useModels } from "@/app/providers/modelContext";
import { modelStorageId } from "@/services/ai/modelSelection";

export function TopHeader() {
  const {
    registry,
    isLoading,
    selectedTextModel,
    selectedImageModel,
    selectTextModel,
    selectImageModel,
  } = useModels();

  return (
    <header className="sticky top-0 z-20 border-b border-[#ded6ca] bg-white/60 px-5 py-4 backdrop-blur-xl md:px-8">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#7d6758] text-white shadow-sm">
            ✦
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#7e7468]">Fashion Studio</p>
            <h1 className="text-xl font-medium tracking-tight">Loom & Spool</h1>
          </div>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="text-xs font-semibold text-ink/55">
            Text model
            <select
              className="mt-1 block w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm text-ink md:w-52"
              disabled={isLoading || !registry?.textModels.length}
              onChange={(event) => selectTextModel(event.target.value)}
              value={selectedTextModel ? modelStorageId(selectedTextModel) : ""}
            >
              {registry?.textModels.map((model) => (
                <option key={`${model.provider}:${model.id}`} value={modelStorageId(model)}>
                  {model.providerLabel}: {model.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-ink/55">
            Image model
            <select
              className="mt-1 block w-full rounded-md border border-ink/15 bg-white px-3 py-2 text-sm text-ink md:w-52"
              disabled={isLoading || !registry?.imageModels.length}
              onChange={(event) => selectImageModel(event.target.value)}
              value={selectedImageModel ? modelStorageId(selectedImageModel) : ""}
            >
              {registry?.imageModels.map((model) => (
                <option key={`${model.provider}:${model.id}`} value={modelStorageId(model)}>
                  {model.providerLabel}: {model.name}
                </option>
              ))}
            </select>
          </label>
          <LinkButton to={routes.createDesign}>Create design</LinkButton>
        </div>
      </div>
    </header>
  );
}
