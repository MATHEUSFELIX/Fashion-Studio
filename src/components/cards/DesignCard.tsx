import { Link } from "react-router-dom";
import { routes } from "@/app/router/routes";
import { SourceBadge } from "@/components/feedback/SourceBadge";
import { Badge } from "@/components/ui/Badge";
import type { Design } from "@/types/domain/studio";
import { formatDate } from "@/utils/format";

export function DesignCard({ design }: { design: Design }) {
  return (
    <Link
      className="group grid overflow-hidden rounded-lg border border-ink/10 bg-white/70 transition hover:-translate-y-0.5 hover:shadow-soft"
      to={routes.designDetail(design.id)}
    >
      <img className="h-48 w-full object-cover" src={design.heroImage} alt="" />
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          <SourceBadge source={design.source} />
          <Badge>{design.status}</Badge>
        </div>
        <div>
          <h3 className="font-semibold tracking-tight">{design.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-ink/60">{design.prompt}</p>
        </div>
        <p className="text-xs text-ink/45">Updated {formatDate(design.updatedAt)}</p>
      </div>
    </Link>
  );
}
