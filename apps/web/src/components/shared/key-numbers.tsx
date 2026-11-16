import { cn, Typography } from "@heroui/react";
import type { ReactNode } from "react";

/** One ruled key number: label, figure and an optional note. */
export interface KeyNumber {
  label: ReactNode;
  note?: ReactNode;
  value: ReactNode;
}

/**
 * One cell of the key-number grid. `KeyNumberList` draws a whole list; a page
 * whose figures stream renders the cells itself inside its own `<dl>`.
 */
function KeyNumberItem({ label, note, value }: KeyNumber) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 border-separator border-b py-3">
      <dt className="font-semibold text-muted text-xs">{label}</dt>
      <dd className="font-semibold text-xl tabular-nums">{value}</dd>
      {note ? (
        <dd className="text-muted text-xs tabular-nums">{note}</dd>
      ) : null}
    </div>
  );
}

/**
 * The ruled grid the key numbers sit in: four across under the head, then
 * `besideHead` across once the head grid puts them in its right half. The
 * Makes, COE premiums, PQP, deregistrations and EV pages stay four across;
 * the other pages drop to two.
 */
function KeyNumberGrid({
  besideHead = 2,
  children,
}: {
  besideHead?: 2 | 4;
  children: ReactNode;
}) {
  return (
    <dl
      className={cn(
        "grid @3xl:grid-cols-4 grid-cols-2 gap-x-6 border-separator border-t",
        besideHead === 2 && "@7xl:grid-cols-2",
      )}
    >
      {children}
    </dl>
  );
}

/** A whole list of key numbers in their ruled grid. */
export function KeyNumberList({
  besideHead,
  items,
}: {
  besideHead?: 2 | 4;
  items: KeyNumber[];
}) {
  return (
    <KeyNumberGrid besideHead={besideHead}>
      {items.map((item, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: labels may be nodes
        <KeyNumberItem key={index} {...item} />
      ))}
    </KeyNumberGrid>
  );
}

/**
 * The key numbers beside the page head on a wide column and under it before
 * then, closed by the "on this page" links to each figure and the source.
 * The eyebrow, links and source are fixed copy, so they stay in the static
 * shell; only `children` may stream.
 */
export function KeysAside({
  children,
  eyebrow,
  jump,
  label,
  source,
}: {
  children: ReactNode;
  eyebrow: ReactNode;
  jump: { href: string; label: string }[];
  label: string;
  source: ReactNode;
}) {
  return (
    <aside aria-label={label} className="flex min-w-0 flex-col gap-3.5">
      <Typography.Paragraph
        className="uppercase"
        color="muted"
        size="xs"
        weight="semibold"
      >
        {eyebrow}
      </Typography.Paragraph>
      {children}
      <nav aria-label="On this page">
        <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
          {jump.map((item) => (
            <li key={item.label}>
              <a
                className="font-medium text-accent-strong no-underline transition-colors hover:text-accent-deep"
                href={item.href}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <Typography.Paragraph color="muted" size="xs">
        {source}
      </Typography.Paragraph>
    </aside>
  );
}
