import { Typography } from "@heroui/react";
import { FAQ_SECTIONS } from "@web/app/(main)/(site)/learn/components/faq-data";
import { GLOSSARY_CATEGORIES } from "@web/app/(main)/(site)/learn/components/glossary-data";
import { GUIDE_TOPICS, GUIDES } from "@web/app/(main)/(site)/learn/lib/guides";
import type { Route } from "next";
import Link from "next/link";

/**
 * Every figure but the COE term is counted from the page's own content, so
 * the list cannot drift out of step with what is published beneath it.
 */
const KEY_NUMBERS = [
  {
    label: "Guides",
    value: String(GUIDES.length),
    note: "In-depth guides to the rules that set the price",
  },
  {
    label: "Glossary terms",
    value: String(
      GLOSSARY_CATEGORIES.reduce(
        (total, category) => total + category.terms.length,
        0,
      ),
    ),
    note: "Terms defined in the glossary",
  },
  {
    label: "FAQ answers",
    value: String(
      FAQ_SECTIONS.reduce((total, section) => total + section.items.length, 0),
    ),
    note: "Questions answered in the FAQ",
  },
  {
    label: "COE term",
    value: "10 yrs",
    note: "Before renewal or deregistration",
  },
];

const JUMP_LINKS = [
  ...GUIDE_TOPICS.map(({ id, title }) => ({ href: `#${id}`, label: title })),
  { href: "#glossary", label: "Glossary" },
  { href: "#faq", label: "FAQ" },
  { href: "#data-sources", label: "Where the data comes from" },
];

/**
 * The key numbers beside the head once the page is wide, under it before
 * then, with the links down the page beneath them. All fixed content, so it
 * is part of the static shell.
 */
export function LearnKeyNumbers() {
  return (
    <aside aria-label="Key numbers" className="flex flex-col gap-3">
      <Typography.Paragraph
        className="uppercase"
        color="muted"
        size="xs"
        weight="semibold"
      >
        Key numbers
      </Typography.Paragraph>
      <dl className="grid @3xl:grid-cols-4 grid-cols-2 gap-x-6 border-separator border-t">
        {KEY_NUMBERS.map(({ label, note, value }) => (
          <div
            className="flex flex-col gap-0.5 border-separator border-b py-3"
            key={label}
          >
            <dt className="font-semibold text-muted text-xs">{label}</dt>
            <dd className="font-semibold text-xl tabular-nums">{value}</dd>
            <dd className="text-muted text-xs">{note}</dd>
          </div>
        ))}
      </dl>
      <nav aria-label="On this page">
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
          {JUMP_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                className="font-semibold text-accent-strong no-underline transition-colors hover:text-accent-deep"
                href={href as Route}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <Typography.Paragraph color="muted" size="xs">
        Counts of the guides, glossary terms and FAQ answers on this page.
      </Typography.Paragraph>
    </aside>
  );
}
