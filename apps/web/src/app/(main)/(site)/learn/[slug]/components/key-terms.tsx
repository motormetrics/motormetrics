import { Typography } from "@heroui/react";
import { GLOSSARY_CATEGORIES } from "@web/app/(main)/(site)/learn/components/glossary-data";
import type { Guide } from "@web/app/(main)/(site)/learn/lib/guides";
import { getAllGuideSlugs } from "@web/app/(main)/(site)/learn/lib/guides";
import { SectionHead } from "@web/components/shared/overview";
import type { Route } from "next";
import Link from "next/link";

const DEFINITIONS = new Map(
  GLOSSARY_CATEGORIES.flatMap(({ terms }) =>
    terms.map(({ definition, term }) => [term, definition] as const),
  ),
);

const guideSlugs = getAllGuideSlugs();

/**
 * After the article: the terms the guide leans on, defined from the
 * glossary, then the pages carrying the live figures as a row of links.
 */
export function KeyTerms({ guide }: { guide: Guide }) {
  const terms = guide.relatedTerms
    .map((term) => ({ definition: DEFINITIONS.get(term), term }))
    .filter(
      (entry): entry is { definition: string; term: string } =>
        entry.definition !== undefined,
    );

  if (terms.length === 0 && guide.relatedLinks.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <SectionHead eyebrow="Reference" title="Key terms" />

      {terms.length > 0 ? (
        <div className="@container">
          <dl className="grid @3xl:grid-cols-2 @6xl:grid-cols-3 grid-cols-1 gap-x-10 border-border border-t">
            {terms.map(({ definition, term }) => {
              const slug = term.toLowerCase();

              return (
                <div
                  className="flex flex-col gap-1 border-separator border-b py-3"
                  key={term}
                >
                  <dt className="font-semibold text-sm">
                    {guideSlugs.includes(slug) ? (
                      <Link
                        className="text-accent-strong no-underline transition-colors hover:text-accent-deep"
                        href={`/learn/${slug}`}
                      >
                        {term} →
                      </Link>
                    ) : (
                      term
                    )}
                  </dt>
                  <dd>
                    <Typography.Paragraph
                      className="text-muted-strong leading-normal"
                      size="sm"
                    >
                      {definition}
                    </Typography.Paragraph>
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      ) : null}

      {guide.relatedLinks.length > 0 ? (
        <nav
          aria-label="Check the current figures"
          className="flex flex-col gap-2"
        >
          <span className="font-semibold text-muted text-xs">
            Check the current figures
          </span>
          <ul className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm">
            {guide.relatedLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  className="font-semibold text-accent-strong no-underline transition-colors hover:text-accent-deep"
                  href={href as Route}
                >
                  {label} →
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </section>
  );
}
