import { GLOSSARY_CATEGORIES } from "@web/app/(main)/(site)/learn/components/glossary-data";
import type { Guide } from "@web/app/(main)/(site)/learn/lib/guides";
import {
  getAllGuideSlugs,
  getGuideHeadings,
} from "@web/app/(main)/(site)/learn/lib/guides";
import { InkPanel } from "@web/components/shared/bento";
import Typography from "@web/components/typography";
import type { Route } from "next";
import Link from "next/link";

const DEFINITIONS = new Map(
  GLOSSARY_CATEGORIES.flatMap(({ terms }) =>
    terms.map(({ definition, term }) => [term, definition] as const),
  ),
);

const guideSlugs = getAllGuideSlugs();

/**
 * The comp's right-hand rail: contents, the terms the guide leans on, and the
 * pages carrying the live figures.
 *
 * The contents are read out of the guide's own markdown rather than listed
 * separately, so they cannot fall out of step with the article, and the ids
 * match the ones `rehype-slug` gives the rendered headings.
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
    <aside className="flex flex-col gap-6 lg:sticky lg:top-9">
      {headings.length > 0 ? (
        <nav
          aria-label="On this page"
          className="flex flex-col gap-3.5 rounded-2xl bg-surface-secondary p-7"
        >
          <Typography.H3 className="font-bold text-base">
            In this guide
          </Typography.H3>
          <ol className="flex flex-col gap-0.5">
            {headings.map(({ id, title }) => (
              <li key={id}>
                <Link
                  className="block rounded-lg px-3 py-2 font-semibold text-muted text-sm no-underline transition-colors hover:bg-surface hover:text-foreground"
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
        <div className="flex flex-col gap-3.5 rounded-2xl bg-surface p-7 shadow-surface">
          <Typography.H3 className="font-bold text-base">
            Key terms
          </Typography.H3>
          {terms.map(({ definition, term }) => {
            const slug = term.toLowerCase();

            return (
              <div
                className="flex flex-col gap-1 border-border border-t pt-3"
                key={term}
              >
                {guideSlugs.includes(slug) ? (
                  <Link
                    className="font-bold text-accent-strong text-sm no-underline transition-colors hover:text-accent-deep"
                    href={`/learn/${slug}`}
                  >
                    {term} →
                  </Link>
                ) : (
                  <span className="font-bold text-accent-strong text-sm">
                    {term}
                  </span>
                )}
                <Typography.Caption className="font-medium text-muted leading-[1.5]">
                  {definition}
                </Typography.Caption>
              </div>
            );
          })}
        </div>
      ) : null}

      {guide.relatedLinks.length > 0 ? (
        <InkPanel className="rounded-2xl">
          <Typography.TextSm className="font-semibold text-accent-foreground/85 text-base">
            Check the current figures
          </Typography.TextSm>
          {guide.relatedLinks.map(({ href, label }) => (
            <Link
              className="font-bold text-accent-on-dark text-sm no-underline transition-colors hover:text-accent-foreground"
              href={href as Route}
              key={href}
            >
              {label} →
            </Link>
          ))}
        </InkPanel>
      ) : null}
    </aside>
  );
}
