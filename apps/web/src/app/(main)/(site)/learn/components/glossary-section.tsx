import { Typography } from "@heroui/react";
import { GLOSSARY_CATEGORIES } from "@web/app/(main)/(site)/learn/components/glossary-data";
import { getAllGuideSlugs } from "@web/app/(main)/(site)/learn/lib/guides";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import Link from "next/link";

const guideSlugs = getAllGuideSlugs();

const termCount = GLOSSARY_CATEGORIES.reduce(
  (total, category) => total + category.terms.length,
  0,
);

/**
 * The glossary: the head above the categories, which flow two or three up as
 * the column allows, each a ruled list of term and definition under a small
 * label. Terms with a guide of their own link to it.
 */
export function GlossarySection() {
  return (
    <section className="flex scroll-mt-24 flex-col gap-5" id="glossary">
      <SectionHead
        caption="The abbreviations that appear on every invoice, quotation and bidding result, in one place."
        eyebrow="Reference"
        title="Glossary"
      />

      <div className="@container flex min-w-0 flex-col gap-4">
        <div className="grid @3xl:grid-cols-2 @6xl:grid-cols-3 grid-cols-1 gap-x-12 gap-y-7">
          {GLOSSARY_CATEGORIES.map((category) => (
            <div className="flex min-w-0 flex-col" key={category.title}>
              <span className="border-border border-b pb-2 font-semibold text-muted text-xs">
                {category.title}
              </span>
              {category.terms.map(({ definition, term }) => {
                const slug = term.toLowerCase();

                return (
                  <div
                    className="flex items-baseline gap-3.5 border-separator border-b py-2.5 max-md:flex-col max-md:gap-0.5"
                    key={term}
                  >
                    {guideSlugs.includes(slug) ? (
                      <Link
                        className="w-24 shrink-0 font-semibold text-accent-strong text-sm no-underline transition-colors hover:text-accent-deep"
                        href={`/learn/${slug}`}
                      >
                        {term} →
                      </Link>
                    ) : (
                      <span className="w-24 shrink-0 font-semibold text-sm">
                        {term}
                      </span>
                    )}
                    <Typography.Paragraph
                      className="min-w-0 flex-1 text-muted-strong leading-normal"
                      size="sm"
                    >
                      {definition}
                    </Typography.Paragraph>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <SourceNote>
          {termCount} terms. Linked terms have a full guide.
        </SourceNote>
      </div>
    </section>
  );
}
