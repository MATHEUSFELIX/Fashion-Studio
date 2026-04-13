import { SourceBadge } from "@/components/feedback/SourceBadge";
import { Badge } from "@/components/ui/Badge";
import type { Asset } from "@/types/domain/studio";
import { titleCase } from "@/utils/format";

export function AssetCard({ asset }: { asset: Asset }) {
  return (
    <article className="overflow-hidden rounded-lg border border-ink/10 bg-white/70">
      <img className="h-40 w-full object-cover" src={asset.image} alt="" />
      <div className="space-y-3 p-4">
        <div className="flex flex-wrap gap-2">
          <Badge>{titleCase(asset.type)}</Badge>
          <SourceBadge source={asset.source} />
        </div>
        <h3 className="font-semibold">{asset.title}</h3>
      </div>
    </article>
  );
}
