import { useStudio } from "@/app/providers/studioContext";
import { Panel } from "@/components/panels/Panel";
import { Badge } from "@/components/ui/Badge";

export function CollectionsPage() {
  const { collections, activeCollectionId, setActiveCollectionId } = useStudio();

  return (
    <div className="space-y-6">
      <Panel>
        <Badge tone="human">Collection builder</Badge>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Collections</h2>
        <p className="mt-2 text-ink/65">
          Create presets in the sidebar. Select one here to drive SKU prompts and photoshoot
          consistency.
        </p>
      </Panel>
      <div className="grid gap-4 md:grid-cols-2">
        {collections.map((collection) => (
          <button
            className={`rounded-lg border p-5 text-left transition ${
              activeCollectionId === collection.id
                ? "border-[#7d6758] bg-white shadow-soft"
                : "border-ink/10 bg-white/65 hover:border-[#7d6758]"
            }`}
            key={collection.id}
            onClick={() => setActiveCollectionId(collection.id)}
            type="button"
          >
            <div className="flex flex-wrap gap-2">
              <Badge tone={activeCollectionId === collection.id ? "success" : "neutral"}>
                {activeCollectionId === collection.id ? "Active" : "Preset"}
              </Badge>
              <Badge>{collection.ageGroup}</Badge>
              <Badge>{collection.season}</Badge>
            </div>
            <h3 className="mt-4 text-2xl font-semibold">{collection.name}</h3>
            <p className="mt-2 text-sm text-ink/60">{collection.theme}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <Meta label="Palette" value={collection.palette} />
              <Meta label="Materials" value={collection.materials} />
            </div>
            <p className="mt-4 text-sm text-ink/65">{collection.rules}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-ink/5 p-3">
      <p className="text-xs font-semibold uppercase text-ink/45">{label}</p>
      <p className="mt-1 text-sm">{value}</p>
    </div>
  );
}
