import { Badge } from "@/components/ui/Badge";
import type { PersonaReaction } from "@/features/fashion-intelligence/types/intelligence";

const toneBySentiment = {
  positive: "success",
  mixed: "system",
  negative: "human",
} as const;

export function PersonaReactionCard({ reaction }: { reaction: PersonaReaction }) {
  return (
    <article className="rounded-md border border-ink/10 bg-white/70 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-semibold">{reaction.personaName}</h4>
          <p className="text-xs text-ink/50">{reaction.role}</p>
        </div>
        <Badge tone={toneBySentiment[reaction.sentiment]}>{reaction.sentiment}</Badge>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-ink/70">{reaction.reactionSummary}</p>
      <div className="mt-4 grid gap-3 text-xs md:grid-cols-3">
        <div>
          <p className="font-bold uppercase tracking-wider text-ink/40">Praise</p>
          <p className="mt-1 text-ink/65">{reaction.mainPraise}</p>
        </div>
        <div>
          <p className="font-bold uppercase tracking-wider text-ink/40">Concern</p>
          <p className="mt-1 text-ink/65">{reaction.mainConcern}</p>
        </div>
        <div>
          <p className="font-bold uppercase tracking-wider text-ink/40">Recommendation</p>
          <p className="mt-1 text-ink/65">{reaction.recommendation}</p>
        </div>
      </div>
    </article>
  );
}
