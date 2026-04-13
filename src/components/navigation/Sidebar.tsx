import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useStudio } from "@/app/providers/studioContext";
import { routes } from "@/app/router/routes";
import { Button } from "@/components/ui/Button";

const items = [
  { label: "Collection", to: routes.workspace },
  { label: "Fashion Intelligence", to: routes.fashionIntelligence },
  { label: "SKU Gen", to: routes.createDesign },
  { label: "Photoshoot", to: routes.photoshoot("des_123") },
  { label: "Review", to: routes.review("des_123") },
  { label: "Technical Validation", to: routes.technicalValidation },
  { label: "Export", to: routes.exports },
  { label: "Models", to: routes.models },
];

const fieldClass = "mt-1 w-full rounded-md border border-[#ded6ca] bg-white px-3 py-2 text-sm";

export function Sidebar() {
  const { collections, activeCollection, activeCollectionId, addCollection, setActiveCollectionId } =
    useStudio();
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState("");
  const [ageGroup, setAgeGroup] = useState("3-6 years");
  const [theme, setTheme] = useState("");
  const [season, setSeason] = useState("Core/Essentials");
  const [rules, setRules] = useState("");
  const [categories, setCategories] = useState("t-shirt, pajama, socks");
  const [palette, setPalette] = useState("soft sage, ecru, warm grey");
  const [materials, setMaterials] = useState("organic cotton jersey, rib trims");

  const saveCollection = () => {
    if (!name.trim()) {
      return;
    }
    addCollection({
      name: name.trim(),
      ageGroup,
      theme: theme.trim() || "Minimal everyday basics",
      season,
      rules: rules.trim() || "No logos, no bright colors, no adult styling.",
      categories: categories
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      palette,
      materials,
    });
    setName("");
    setTheme("");
    setRules("");
    setIsCreating(false);
  };

  return (
    <aside className="border-b border-[#ded6ca] bg-white/55 px-4 py-4 text-[#211b17] shadow-[4px_0_24px_-18px_rgba(0,0,0,0.28)] backdrop-blur md:min-h-screen md:w-80 md:border-b-0 md:border-r md:px-5">
      <div className="mb-5 border-b border-[#ded6ca] pb-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#7e7468]">Collections</p>
        <h2 className="mt-1 text-xl font-medium">Loom & Spool</h2>
        <p className="mt-2 text-xs text-[#7e7468]">Active studio preset</p>

        <div className="mt-5 space-y-3">
          <Button
            className="w-full bg-[#211b17] text-white hover:bg-black"
            onClick={() => setIsCreating((current) => !current)}
            type="button"
          >
            {isCreating ? "Close form" : "New Collection"}
          </Button>

          {isCreating ? (
            <div className="rounded-lg border border-[#ded6ca] bg-white p-4 shadow-sm">
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7e7468]">
                  Collection Name
                  <input className={fieldClass} onChange={(event) => setName(event.target.value)} value={name} />
                </label>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7e7468]">
                  Age Group
                  <select
                    className={fieldClass}
                    onChange={(event) => setAgeGroup(event.target.value)}
                    value={ageGroup}
                  >
                    <option>0-2 years</option>
                    <option>3-6 years</option>
                    <option>7-10 years</option>
                    <option>Teen</option>
                  </select>
                </label>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7e7468]">
                  Theme / Vibe
                  <input
                    className={fieldClass}
                    onChange={(event) => setTheme(event.target.value)}
                    placeholder="Coastal soft basics"
                    value={theme}
                  />
                </label>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7e7468]">
                  Season
                  <select
                    className={fieldClass}
                    onChange={(event) => setSeason(event.target.value)}
                    value={season}
                  >
                    <option>Spring/Summer</option>
                    <option>Autumn/Winter</option>
                    <option>Core/Essentials</option>
                    <option>Resort</option>
                  </select>
                </label>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7e7468]">
                  Categories
                  <input
                    className={fieldClass}
                    onChange={(event) => setCategories(event.target.value)}
                    value={categories}
                  />
                </label>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7e7468]">
                  Palette
                  <input
                    className={fieldClass}
                    onChange={(event) => setPalette(event.target.value)}
                    value={palette}
                  />
                </label>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7e7468]">
                  Materials
                  <input
                    className={fieldClass}
                    onChange={(event) => setMaterials(event.target.value)}
                    value={materials}
                  />
                </label>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#7e7468]">
                  Brand Rules
                  <textarea
                    className={`${fieldClass} min-h-20 resize-none`}
                    onChange={(event) => setRules(event.target.value)}
                    placeholder="No logos, no saturated colors..."
                    value={rules}
                  />
                </label>
                <Button className="w-full" disabled={!name.trim()} onClick={saveCollection} type="button">
                  Save preset
                </Button>
              </div>
            </div>
          ) : null}

          <div className="max-h-72 space-y-3 overflow-auto pr-1">
            {collections.map((collection) => (
              <button
                className={`w-full rounded-lg border p-4 text-left transition ${
                  activeCollectionId === collection.id
                    ? "border-[#7d6758] bg-white shadow-sm"
                    : "border-transparent bg-white/45 hover:border-[#ded6ca] hover:bg-white"
                }`}
                key={collection.id}
                onClick={() => setActiveCollectionId(collection.id)}
                type="button"
              >
                <p className="text-sm font-semibold">{collection.name}</p>
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#7e7468]">
                  {collection.season} / {collection.ageGroup}
                </p>
                <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-[#61574d]">
                  {collection.theme}. {collection.palette}.
                </p>
              </button>
            ))}
          </div>

          <div className="rounded-lg border border-[#ded6ca] bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#7e7468]">Selected</p>
            <p className="mt-2 text-sm font-semibold">{activeCollection.name}</p>
            <p className="mt-2 text-xs leading-relaxed text-[#61574d]">{activeCollection.rules}</p>
          </div>
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
        {items.map((item) => (
          <NavLink
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-[#7d6758] text-white shadow-sm"
                  : "text-[#665d53] hover:bg-white hover:text-[#211b17]"
              }`
            }
            end={item.to === routes.workspace}
            key={item.to}
            to={item.to}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
