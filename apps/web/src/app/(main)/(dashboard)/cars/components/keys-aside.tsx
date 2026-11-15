import { Typography } from "@heroui/react";
import type { ReactNode } from "react";

/** One ruled key number: label, figure and an optional note. */
export interface KeyNumber {
  label: ReactNode;
  note?: ReactNode;
  value: ReactNode;
}

/** The ruled two- or four-across grid of key numbers. */
export function KeyNumberList({ items }: { items: KeyNumber[] }) {
  return (
    <dl className="grid @3xl:grid-cols-4 @7xl:grid-cols-2 grid-cols-2 gap-x-6 border-separator border-t">
      {items.map(({ label, note, value }, index) => (
        <div
          className="flex min-w-0 flex-col gap-0.5 border-separator border-b py-3"
          // biome-ignore lint/suspicious/noArrayIndexKey: labels may be nodes
          key={index}
        >
          <dt className="font-semibold text-muted text-xs">{label}</dt>
          <dd className="font-semibold text-xl tabular-nums">{value}</dd>
          {note ? (
            <dd className="text-muted text-xs tabular-nums">{note}</dd>
          ) : null}
        </div>
      ))}
    </dl>
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

/**
 * Direction D's head grid: the head on the left and the key numbers beside
 * it once the column is wide, under it before then.
 */
export function HeadGrid({
  children,
  keys,
}: {
  children: ReactNode;
  keys: ReactNode;
}) {
  return (
    <div className="@container">
      <div className="grid @7xl:grid-cols-2 @7xl:gap-16 gap-10">
        <div className="flex min-w-0 flex-col gap-4">{children}</div>
        {keys}
      </div>
    </div>
  );
}

/** Eyebrow and H1, the same scale as the Makes head. */
export function HeadTitle({
  eyebrow,
  title,
}: {
  eyebrow: ReactNode;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Typography.Paragraph
        className="uppercase"
        color="muted"
        size="xs"
        weight="semibold"
      >
        {eyebrow}
      </Typography.Paragraph>
      <Typography.Heading level={1}>{title}</Typography.Heading>
    </div>
  );
}
