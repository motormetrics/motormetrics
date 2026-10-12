import { GLOSSARY_CATEGORIES } from "@web/app/(main)/(site)/learn/components/glossary-data";
import type { Guide } from "@web/app/(main)/(site)/learn/lib/guides";
import {
  getAllGuideSlugs,
  getGuideHeadings,
} from "@web/app/(main)/(site)/learn/lib/guides";
import { Text } from "@web/components/shared/text";
import type { Route } from "next";
import Link from "next/link";

const DEFINITIONS = new Map(
  GLOSSARY_CATEGORIES.flatMap(({ terms }) =>
    terms.map(({ definition, term }) => [term, definition] as const),
  ),
);

const guideSlugs = getAllGuideSlugs();

/** The small label that opens each rail section, over its rule. */
function RailLabel({ children }: { children: string }) {
  return (
    <span className="border-border border-b pb-2 font-semibold text-muted text-xs">
      {children}
    </span>
  );
}

/**
 * The right-hand rail: contents, the terms the guide leans on, and the pages
 * carrying the live figures, each a ruled list under a small label.
 *
 * The contents are read out of the guide's own markdown rather than listed
 * separately, so they cannot fall out of step with the article, and the ids
 * match the ones `rehype-slug` gives the rendered headings. Below lg the
 * contents drop and the other two sit side by side.
 */
export function GuideSidebar({ guide }: { guide: Guide }) {
  const headings = getGuideHeadings(guide.content);
  const terms = guide.relatedTerms
    .map((term) => ({ definition: DEFINITIONS.get(term), term }))
    .filter(
      (entry): entry is { definition: string; term: string } =>
        entry.definition !== undefined,
    );

  return (
    <aside className="flex flex-col gap-7 max-md:grid-cols-1 max-lg:grid max-lg:grid-cols-2 lg:sticky lg:top-4">
      {headings.length > 0 ? (
        <nav aria-label="On this page" className="flex flex-col max-lg:hidden">
          <RailLabel>In this guide</RailLabel>
          <ol className="flex flex-col pt-1.5">
            {headings.map(({ id, title }) => (
              <li key={id}>
                <Link
                  className="block border-transparent border-l-2 py-1.5 pl-2.5 text-muted-strong text-sm no-underline transition-colors hover:border-l-chart-5 hover:text-accent-strong"
                  href={`#${id}` as Route}
                >
                  {title}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      {terms.length > 0 ? (
        <div className="flex flex-col">
          <RailLabel>Key terms</RailLabel>
          {terms.map(({ definition, term }) => {
            const slug = term.toLowerCase();

            return (
              <div
                className="flex flex-col gap-1 border-separator border-b py-2.5"
                key={term}
              >
                {guideSlugs.includes(slug) ? (
                  <Link
                    className="font-semibold text-accent-strong text-sm no-underline transition-colors hover:text-accent-deep"
                    href={`/learn/${slug}`}
                  >
                    {term} →
                  </Link>
                ) : (
                  <span className="font-semibold text-sm">{term}</span>
                )}
                <Text.Paragraph
                  className="leading-normal"
                  size="sm"
                  tone="strong"
                >
                  {definition}
                </Text.Paragraph>
              </div>
            );
          })}
        </div>
      ) : null}

      {guide.relatedLinks.length > 0 ? (
        <div className="flex flex-col">
          <RailLabel>Check the current figures</RailLabel>
          {guide.relatedLinks.map(({ href, label }) => (
            <Link
              className="border-separator border-b py-2.5 font-semibold text-accent-strong text-sm no-underline transition-colors hover:text-accent-deep"
              href={href as Route}
              key={href}
            >
              {label} →
            </Link>
          ))}
        </div>
      ) : null}
    </aside>
  );
}
