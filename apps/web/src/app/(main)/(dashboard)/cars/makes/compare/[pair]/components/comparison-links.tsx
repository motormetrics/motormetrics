import {
  type ComparePair,
  pairSlug,
} from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/pairs";
import { SectionHead, SectionLink } from "@web/components/shared/overview";
import { getMakeFromSlug } from "@web/queries/cars/makes/get-make-from-slug";

/** The display name of each make in a pair, as the make page shows it. */
export async function pairNames(
  pair: ComparePair,
): Promise<[string, string] | undefined> {
  // A lambda rather than passing `getMakeFromSlug` to `map`: the index and
  // array would become part of its `'use cache'` key.
  const [nameA, nameB] = await Promise.all(
    pair.map((makeSlug) => getMakeFromSlug(makeSlug)),
  );
  return nameA && nameB ? [nameA, nameB] : undefined;
}

/**
 * "A vs B" links to curated comparison pages, under a section head. Renders
 * nothing when `pairs` is empty, so a make outside the curated list shows no
 * section.
 */
export async function ComparisonLinks({
  eyebrow,
  link,
  pairs,
  title,
}: {
  eyebrow: string;
  link?: { href: string; label: string };
  pairs: readonly ComparePair[];
  title: string;
}) {
  if (pairs.length === 0) {
    return null;
  }

  const links = await Promise.all(
    pairs.map(async (pair) => ({
      names: await pairNames(pair),
      slug: pairSlug(pair),
    })),
  );

  return (
    <section className="flex flex-col gap-4">
      <SectionHead eyebrow={eyebrow} link={link} title={title} />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {links.map(({ names, slug }) =>
          names ? (
            <SectionLink
              className="ml-0"
              href={`/cars/makes/compare/${slug}`}
              key={slug}
            >
              {`${names[0]} vs ${names[1]}`}
            </SectionLink>
          ) : null,
        )}
      </div>
    </section>
  );
}
