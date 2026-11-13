"use client";

import { cn, Label, SearchField, Typography } from "@heroui/react";
import {
  makesSearchParams,
  serialize,
} from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import Link from "next/link";
import { useQueryState } from "nuqs";
import type { ReactNode } from "react";

export interface MakeCard {
  /** "+12.3% on 2025", or why the change is withheld. */
  change: string;
  count: string;
  /** This page with the make selected, built on the server. */
  href: string;
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
 * Direction D's makes index: a search field beside the server-built switches,
 * then one card per make. A card selects its make; once one is selected the
 * cards fold into a list beside that make's detail. The search filters what
 * is already in the page as the reader types, so it stays a shallow `?q=`
 * update with no round trip.
 */
export function MakeCards({
  cards,
  detail,
  selectedSlug,
  switches,
}: {
  cards: readonly MakeCard[];
  /** The selected make's detail, rendered on the server. */
  detail: ReactNode;
  selectedSlug: string | null;
  /** The powertrain, period and sort switches, rendered on the server. */
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
  // The server built each link with the search as it was on load; carry the
  // one typed since, so selecting a make keeps the list the reader filtered.
  const hrefOf = (card: MakeCard) => serialize(card.href, { q: query });

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

      {selectedSlug ? (
        <div className="grid @3xl:grid-cols-3 grid-cols-1 items-start gap-8">
          {/* The list scrolls on its own beside the detail once there is
              room for both; on a phone it sits above the detail. */}
          <ul
            aria-label="Makes"
            className="flex @3xl:max-h-screen max-h-96 flex-col @3xl:overflow-y-auto overflow-y-auto border-separator border-y"
          >
            {shown.map((card) => (
              <li key={card.slug}>
                <MakeRowLink
                  card={card}
                  href={hrefOf(card)}
                  selected={card.slug === selectedSlug}
                />
              </li>
            ))}
          </ul>
          <div className="@3xl:col-span-2 min-w-0" aria-live="polite">
            {detail}
          </div>
        </div>
      ) : shown.length > 0 ? (
        <ul className="grid @3xl:grid-cols-3 @5xl:grid-cols-4 @7xl:grid-cols-5 @md:grid-cols-2 grid-cols-1 gap-2.5">
          {shown.map((card) => (
            <li key={card.slug}>
              <MakeCardLink card={card} href={hrefOf(card)} />
            </li>
          ))}
        </ul>
      ) : null}

      {shown.length === 0 ? (
        <Typography.Paragraph color="muted" size="sm">
          No make matches “{query}”. Try part of the name, such as “Merc”.
        </Typography.Paragraph>
      ) : null}
    </div>
  );
}

/** One line of the list beside the detail: rank, logo, name and count. */
function MakeRowLink({
  card,
  href,
  selected,
}: {
  card: MakeCard;
  href: string;
  selected: boolean;
}) {
  return (
    <Link
      aria-current={selected ? "true" : undefined}
      className={cn(
        "flex min-w-0 items-center gap-2.5 border-separator border-b px-2 py-2 text-sm transition-colors hover:bg-surface-secondary",
        selected && "bg-surface-secondary font-semibold",
      )}
      href={href}
      scroll={false}
    >
      <span className="w-6 shrink-0 text-right text-muted text-xs tabular-nums">
        {card.rank}
      </span>
      <MakeAvatar logoUrl={card.logoUrl} make={card.make} size="sm" />
      <span className="min-w-0 flex-1 truncate">{card.make}</span>
      <span className="font-semibold tabular-nums">{card.count}</span>
    </Link>
  );
}

function MakeCardLink({ card, href }: { card: MakeCard; href: string }) {
  const peak = Math.max(...card.trend, 1);

  return (
    // Every card links to this same route, so they share one prefetched App
    // Shell (Partial Prefetching). The index stays in place rather than
    // jumping to the top of the page.
    <Link
      className="flex h-full min-w-0 flex-col gap-2.5 rounded-lg border border-separator bg-surface p-3.5 transition-colors hover:border-border hover:bg-surface-secondary"
      href={href}
      scroll={false}
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
