import { useParams } from "react-router-dom";
import { routes } from "@/app/router/routes";
import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { SourceBadge } from "@/components/feedback/SourceBadge";
import { Panel } from "@/components/panels/Panel";
import { Badge } from "@/components/ui/Badge";
import { LinkButton } from "@/components/ui/LinkButton";
import { useAsync } from "@/hooks/useAsync";
import { api } from "@/services/api/mockApi";
import { formatDate, titleCase } from "@/utils/format";

export function DesignDetailPage() {
  const { designId = "" } = useParams();
  const design = useAsync(() => api.getDesign(designId), [designId]);

  return (
    <AsyncBoundary {...design}>
      {(data) => (
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Panel className="overflow-hidden p-0">
            <img className="h-[420px] w-full object-cover" src={data.heroImage} alt="" />
            <div className="space-y-4 p-6">
              <div className="flex flex-wrap gap-2">
                <SourceBadge source={data.source} />
                <Badge>{data.status}</Badge>
              </div>
              <div>
                <h2 className="text-3xl font-semibold tracking-tight">{data.title}</h2>
                <p className="mt-2 text-ink/65">{data.prompt}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-4">
                {Object.entries(data.attributes).map(([key, value]) => (
                  <div className="rounded-md bg-ink/5 p-3" key={key}>
                    <p className="text-xs font-semibold uppercase text-ink/45">{titleCase(key)}</p>
                    <p className="mt-1 text-sm">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <div className="space-y-5">
            <Panel>
              <h3 className="text-lg font-semibold">Next actions</h3>
              <div className="mt-4 grid gap-3">
                <LinkButton to={routes.variations(data.id)}>Generate variations</LinkButton>
                <LinkButton to={routes.photoshoot(data.id)} variant="secondary">
                  Start photoshoot
                </LinkButton>
                <LinkButton to={routes.technicalFlat(data.id)} variant="secondary">
                  Generate technical flat
                </LinkButton>
                <LinkButton to={routes.scoring(data.id)} variant="secondary">
                  Score design
                </LinkButton>
                <LinkButton to={routes.exports} variant="ghost">
                  Prepare export
                </LinkButton>
              </div>
            </Panel>
            <Panel>
              <h3 className="text-lg font-semibold">Version history</h3>
              <div className="mt-4 space-y-4">
                {data.versionHistory.length === 0 ? (
                  <p className="text-sm text-ink/60">No version history yet.</p>
                ) : (
                  data.versionHistory.map((version) => (
                    <div className="border-t border-ink/10 pt-4" key={version.id}>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{version.label}</p>
                        <SourceBadge source={version.source} />
                      </div>
                      <p className="mt-1 text-sm text-ink/60">{version.note}</p>
                      <p className="mt-2 text-xs text-ink/45">{formatDate(version.createdAt)}</p>
                    </div>
                  ))
                )}
              </div>
            </Panel>
          </div>
        </div>
      )}
    </AsyncBoundary>
  );
}
