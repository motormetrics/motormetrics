import { GLOSSARY_CATEGORIES } from "@web/app/(main)/(site)/learn/components/glossary-data";
import { getAllGuideSlugs } from "@web/app/(main)/(site)/learn/lib/guides";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { Text } from "@web/components/shared/text";
import Link from "next/link";

const guideSlugs = getAllGuideSlugs();

const termCount = GLOSSARY_CATEGORIES.reduce(
  (total, category) => total + category.terms.length,
  0,
);

/**
 * The glossary: a heading in a narrow left column against the categories two
 * up, each a ruled list of term and definition under a small label. Terms with
 * a guide of their own link to it.
 */
export function GlossarySection() {
  return (
    <section
      className="grid scroll-mt-24 grid-cols-1 items-start gap-4 lg:grid-cols-4 lg:gap-14"
      id="glossary"
    >
      <SectionHead
        caption="The abbreviations that appear on every invoice, quotation and bidding result, in one place."
        eyebrow="Reference"
        title="Glossary"
      />

      <div className="flex min-w-0 flex-col gap-4 lg:col-span-3">
        <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
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
                    <Text.Paragraph
                      className="min-w-0 flex-1 leading-normal"
                      size="sm"
                      tone="strong"
                    >
                      {definition}
                    </Text.Paragraph>
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
