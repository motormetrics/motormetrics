import { FAQ_SECTIONS } from "@web/app/(main)/(site)/learn/components/faq-data";
import { GLOSSARY_CATEGORIES } from "@web/app/(main)/(site)/learn/components/glossary-data";
import { GUIDES } from "@web/app/(main)/(site)/learn/lib/guides";

/**
 * The four rule-topped figures the comp runs under the head.
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
    <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
      {STATS.map(({ label, value }) => (
        <div
          className="flex flex-col gap-1.5 border-border border-t-2 pt-7"
          key={label}
        >
          <span className="font-extrabold text-4xl tabular-nums leading-none tracking-tight">
            {value}
          </span>
          <span className="font-semibold text-muted text-sm">{label}</span>
        </div>
      ))}
    </div>
  );
}
