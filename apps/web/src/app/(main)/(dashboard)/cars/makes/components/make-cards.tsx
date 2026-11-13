"use client";

import { cn, Label, SearchField, Typography } from "@heroui/react";
import { makesSearchParams } from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import Link from "next/link";
import { useQueryState } from "nuqs";
import type { ReactNode } from "react";

export interface MakeCard {
  /** "+12.3% on 2025", or why the change is withheld. */
  change: string;
  count: string;
  logoUrl: string | null;
  make: string;
  rank: number;
  /** "24.9%", or "<0.1%" for the long tail. */
  share: string;
  slug: string;
  /** Rolling 12-month registrations, oldest first. */
  trend: number[];
}

/**
 * Direction D's makes index: a search field beside the server-built period
 * and sort switches, then one card per make linking to its page. The search
 * filters the cards already in the page as the reader types, so it stays a
 * shallow `?q=` update with no round trip.
 */
export function MakeCards({
  cards,
  switches,
}: {
  cards: readonly MakeCard[];
  /** The period and sort switches, rendered on the server. */
  switches: ReactNode;
}) {
  const [query, setQuery] = useQueryState("q", makesSearchParams.q);
  const needle = query.trim().toLowerCase();
  const shown = needle
    ? cards.filter(
        (card) =>
          card.make.toLowerCase().includes(needle) ||
          card.slug.includes(needle),
      )
    : cards;

  return (
    <div className="@container flex flex-col gap-5">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
        <SearchField
          className="w-full max-w-72"
          onChange={(value) => setQuery(value || null)}
          value={query}
        >
          <Label>Find a make</Label>
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="e.g. Audi" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        {switches}
        <span
          className="ml-auto self-center text-muted text-sm tabular-nums"
          role="status"
        >
          {shown.length} {shown.length === 1 ? "make" : "makes"}
        </span>
      </div>

      {shown.length > 0 ? (
        <ul className="grid @3xl:grid-cols-3 @5xl:grid-cols-4 @7xl:grid-cols-5 @md:grid-cols-2 grid-cols-1 gap-2.5">
          {shown.map((card) => (
            <li key={card.slug}>
              <MakeCardLink card={card} />
            </li>
          ))}
        </ul>
      ) : (
        <Typography.Paragraph color="muted" size="sm">
          No make matches “{query}”. Try part of the name, such as “Merc”.
        </Typography.Paragraph>
      )}
    </div>
  );
}

function MakeCardLink({ card }: { card: MakeCard }) {
  const peak = Math.max(...card.trend, 1);

  return (
    // Sixty-odd cards in view would prefetch sixty make pages, so each one
    // waits for the click.
    <Link
      className="flex h-full min-w-0 flex-col gap-2.5 rounded-lg border border-separator bg-surface p-3.5 transition-colors hover:border-border hover:bg-surface-secondary"
      href={`/cars/makes/${card.slug}`}
      prefetch={false}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <MakeAvatar logoUrl={card.logoUrl} make={card.make} size="sm" />
        <span className="truncate font-semibold">{card.make}</span>
        <span className="ml-auto text-muted text-xs tabular-nums">
          #{card.rank}
        </span>
      </span>
      <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
        <span className="font-semibold text-xl tabular-nums">{card.count}</span>
        <span className="text-muted text-sm tabular-nums">
          {card.share} · {card.change}
        </span>
      </span>
      {/* The last twelve months, the latest one in the darker shade. */}
      <span aria-hidden className="flex h-8 items-end gap-0.5">
        {card.trend.map((value, index) => (
          <span
            className={cn(
              "flex-1 rounded-t-xs",
              index === card.trend.length - 1 ? "bg-chart-1" : "bg-chart-5",
            )}
            // biome-ignore lint/suspicious/noArrayIndexKey: a month's position is its identity
            key={index}
            style={{ height: `${Math.max((value / peak) * 100, 2)}%` }}
          />
        ))}
      </span>
    </Link>
  );
}
