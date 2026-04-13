import { routes } from "@/app/router/routes";
import { useStudio } from "@/app/providers/studioContext";
import { DesignCard } from "@/components/cards/DesignCard";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { Panel } from "@/components/panels/Panel";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/LinkButton";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/services/api/mockApi";

export function WorkspacePage() {
  const workspace = useAsync(api.getWorkspace, []);
  const { activeCollection } = useStudio();

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
              <LinkButton to={routes.createDesign}>Generate concepts</LinkButton>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1fr_0.7fr]">
            <Panel className="bg-white/70">
              <div className="flex items-center gap-2 text-[#7d6758]">
                <span className="text-lg">✦</span>
                <h3 className="text-lg font-medium">Structured collection brief</h3>
              </div>
              <div className="mt-6 space-y-7">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-ink/45">Concept</h4>
                  <p className="mt-2 text-sm leading-relaxed text-ink/75">
                    A premium minimalist line of soft everyday pieces for children, focused on
                    {` ${activeCollection.materials}, ${activeCollection.palette}. Every generated image
                    should read like a kidswear SKU or neutral catalog photoshoot.`}
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-ink/45">
                      Key design principles
                    </h4>
                    <ul className="mt-3 space-y-2 text-sm text-ink/75">
                      <li>Palette: {activeCollection.palette}.</li>
                      <li>Materials: {activeCollection.materials}.</li>
                      <li>Age group: {activeCollection.ageGroup}.</li>
                      <li>{activeCollection.rules}</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-ink/45">
                      Categories
                    </h4>
                    <div className="mt-3 space-y-3">
                      {activeCollection.categories.map(
                        (category) => (
                          <div className="rounded-md border border-ink/10 bg-ink/5 p-3" key={category}>
                            <p className="text-xs font-semibold">{category}</p>
                            <p className="mt-1 text-xs text-ink/55">
                              Simple construction, soft hand feel, clean neutral presentation.
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
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
              <LinkButton to={routes.createDesign} variant="ghost">
                New
              </LinkButton>
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
