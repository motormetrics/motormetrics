import { GLOSSARY_CATEGORIES } from "@web/app/(main)/(site)/learn/components/glossary-data";
import { getAllGuideSlugs } from "@web/app/(main)/(site)/learn/lib/guides";
import { ReportEyebrow } from "@web/components/shared/report";
import Typography from "@web/components/typography";
import Link from "next/link";

const guideSlugs = getAllGuideSlugs();

/**
 * The comp sets the glossary as a heading in a narrow left column against a
 * two-up list of hairline-topped terms — no cards, the rules do the dividing.
 *
 * The comp draws one flat list; the data is grouped into five categories and
 * the grouping is worth keeping, so each category opens with a small caps label
 * over its own two-up list.
 */
export function GlossarySection() {
  return (
    <section
      className="grid scroll-mt-24 grid-cols-1 gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14"
      id="glossary"
    >
      <div className="flex flex-col gap-3">
        <Typography.H2 className="text-4xl">Glossary</Typography.H2>
        <Typography.Text className="text-muted leading-normal">
          The abbreviations that appear on every invoice, quotation and bidding
          result, in one place.
        </Typography.Text>
      </div>

      <div className="flex flex-col gap-10">
        {GLOSSARY_CATEGORIES.map((category) => (
          <div className="flex flex-col gap-5" key={category.title}>
            <ReportEyebrow>{category.title}</ReportEyebrow>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {category.terms.map(({ definition, term }) => {
                const slug = term.toLowerCase();
                const hasGuide = guideSlugs.includes(slug);

                return (
                  <div
                    className="flex flex-col gap-1 border-border border-t pt-4"
                    key={term}
                  >
                    {hasGuide ? (
                      <Link
                        className="font-bold text-accent-strong text-base no-underline transition-colors hover:text-accent-deep"
                        href={`/learn/${slug}`}
                      >
                        {term} →
                      </Link>
                    ) : (
                      <span className="font-bold text-accent-strong text-base">
                        {term}
                      </span>
                    )}
                    <Typography.TextSm className="leading-normal">
                      {definition}
                    </Typography.TextSm>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
