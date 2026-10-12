import { Typography } from "@heroui/react";
import { FAQ_SECTIONS } from "@web/app/(main)/(site)/learn/components/faq-data";
import { GLOSSARY_CATEGORIES } from "@web/app/(main)/(site)/learn/components/glossary-data";
import { GUIDES } from "@web/app/(main)/(site)/learn/lib/guides";
import { SourceNote } from "@web/components/shared/overview";

/**
 * The four figures the comp runs under the head, as a ruled strip: four
 * across from lg, two-by-two below, with the rules following the layout.
 *
 * Every figure is counted from the page's own content rather than written down,
 * so the row cannot drift out of step with what is published beneath it. The
 * comp's other two figures — "6 cost components" and "10 yrs" as a headline —
 * are not counted anywhere in the codebase, so the row carries the COE term as
 * the one domain constant and counts the rest.
 */
const STATS = [
  {
    label: "In-depth guides to the rules that set the price",
    value: String(GUIDES.length),
  },
  {
    label: "Terms defined in the glossary",
    value: String(
      GLOSSARY_CATEGORIES.reduce(
        (total, category) => total + category.terms.length,
        0,
      ),
    ),
  },
  {
    label: "Questions answered in the FAQ",
    value: String(
      FAQ_SECTIONS.reduce((total, section) => total + section.items.length, 0),
    ),
  },
  {
    label: "COE term before renewal or deregistration",
    value: "10 yrs",
  },
];

export function LearnStats() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid grid-cols-2 border-border border-t border-b border-b-separator lg:grid-cols-4">
        {STATS.map(({ label, value }) => (
          <div
            className="flex min-w-0 flex-col gap-1.5 border-separator px-3 pt-3 pb-2.5 first:pl-0 max-lg:nth-3:border-t max-lg:nth-4:border-t max-lg:even:border-l max-lg:odd:pl-0 md:px-5 md:pt-4 md:pb-3.5 lg:not-first:border-l"
            key={label}
          >
            <span className="font-extrabold text-3xl tabular-nums leading-none tracking-tight md:text-4xl">
              {value}
            </span>
            <Typography.Paragraph
              className="text-muted-strong leading-snug"
              size="sm"
            >
              {label}
            </Typography.Paragraph>
          </div>
        ))}
      </div>
      <SourceNote>
        Counts of the guides, glossary terms and FAQ answers on this page.
      </SourceNote>
    </div>
  );
}
