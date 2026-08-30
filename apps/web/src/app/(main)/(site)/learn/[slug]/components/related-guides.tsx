import { Typography } from "@heroui/react";
import { GuideCard } from "@web/app/(main)/(site)/learn/components/guide-card";
import type { Guide } from "@web/app/(main)/(site)/learn/lib/guides";
import { GUIDES } from "@web/app/(main)/(site)/learn/lib/guides";

/** How many the comp's row holds. */
const LIMIT = 3;

/**
 * "Next in this series" — the guides this one leans on, in the order it names
 * them, topped up from the rest of the set if it names fewer than three.
 */
export function RelatedGuides({ guide }: { guide: Guide }) {
  const byTerm = new Map(GUIDES.map((entry) => [entry.term, entry]));

  const related = guide.relatedTerms
    .map((term) => byTerm.get(term))
    .filter((entry): entry is Guide => entry !== undefined);

  const filled = [
    ...related,
    ...GUIDES.filter(
      (entry) => entry.slug !== guide.slug && !related.includes(entry),
    ),
  ]
    .filter((entry) => entry.slug !== guide.slug)
    .slice(0, LIMIT);

  if (filled.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-7">
      <Typography.Heading level={2}>Next in this series</Typography.Heading>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filled.map((entry) => (
          <GuideCard guide={entry} key={entry.slug} />
        ))}
      </div>
    </section>
  );
}
