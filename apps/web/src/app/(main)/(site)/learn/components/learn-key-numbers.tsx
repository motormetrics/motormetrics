import { FAQ_SECTIONS } from "@web/app/(main)/(site)/learn/components/faq-data";
import { GLOSSARY_CATEGORIES } from "@web/app/(main)/(site)/learn/components/glossary-data";
import { GUIDE_TOPICS, GUIDES } from "@web/app/(main)/(site)/learn/lib/guides";
import { KeyNumberList, KeysAside } from "@web/components/shared/key-numbers";

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
    <KeysAside
      eyebrow="Key numbers"
      jump={JUMP_LINKS}
      label="Key numbers"
      source="Counts of the guides, glossary terms and FAQ answers on this page."
    >
      <KeyNumberList besideHead={4} items={KEY_NUMBERS} />
    </KeysAside>
  );
}
