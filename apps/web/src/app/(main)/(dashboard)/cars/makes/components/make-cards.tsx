"use client";

import { cn, Label, SearchField, Typography } from "@heroui/react";
import { makesSearchParams } from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryState, useQueryStates } from "nuqs";
import { type MouseEvent, type ReactNode, useTransition } from "react";

export interface MakeCard {
  /** "+12.3% on 2025", or why the change is withheld. */
  change: string;
  /** The comparison with the selected make, while one is being picked. */
  compareHref?: string;
  count: string;
  /** The make's own page: where the link leads without JavaScript. */
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
 * The index's search field. Without `onChange` it is the stand-in the static
 * shell shows until the browser has read `?q=`.
 */
export function MakeSearchField({
  isReadOnly,
  onChange,
  value = "",
}: {
  isReadOnly?: boolean;
  onChange?: (value: string) => void;
  value?: string;
}) {
  return (
    <SearchField
      className="w-full max-w-72"
      isReadOnly={isReadOnly}
      onChange={onChange}
      value={value}
    >
      <Label>Find a make</Label>
      <SearchField.Group>
        <SearchField.SearchIcon />
        <SearchField.Input placeholder="e.g. Audi" />
        <SearchField.ClearButton />
      </SearchField.Group>
    </SearchField>
  );
}

/**
 * The search over the index. It filters what is already in the page as the
 * reader types, so it stays a shallow `?q=` update with no round trip.
 */
export function MakeSearch() {
  const [query, setQuery] = useQueryState("q", makesSearchParams.q);

  return (
    <MakeSearchField
      onChange={(value) => setQuery(value || null)}
      value={query}
    />
  );
}

/**
 * Direction D's makes index: one card per make, filtered by the search. A
 * card selects its make; once one is selected the cards fold into a list
 * beside that make's detail.
 */
export function MakeCards({
  cards,
  detail,
  selectedSlug,
}: {
  cards: readonly MakeCard[];
  /** The selected make's detail, rendered on the server. */
  detail: ReactNode;
  selectedSlug: string | null;
}) {
  const [query] = useQueryState("q", makesSearchParams.q);
  const needle = query.trim().toLowerCase();
  const shown = needle
    ? cards.filter(
        (card) =>
          card.make.toLowerCase().includes(needle) ||
          card.slug.includes(needle),
      )
    : cards;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // `shallow: false` has the server render the detail for the new `?make=`.
  // The other filters stay in the URL as they are.
  const [, setSelection] = useQueryStates(
    { compare: makesSearchParams.compare, make: makesSearchParams.make },
    { history: "push", scroll: false, shallow: false, startTransition },
  );

  /**
   * Selects the make in place rather than following the link to its page. A
   * modified click (new tab, new window) is left to the browser, and so is
   * every crawler, which only ever sees the link to the make's page.
   */
  const select = (card: MakeCard) => (event: MouseEvent) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();

    if (card.compareHref) {
      router.push(card.compareHref);
      return;
    }
    setSelection({ compare: null, make: card.slug });
  };

  return (
    <>
      <span className="self-end text-muted text-sm tabular-nums" role="status">
        {shown.length} {shown.length === 1 ? "make" : "makes"}
      </span>

      {selectedSlug ? (
        <div
          aria-busy={isPending}
          className={cn(
            "grid @3xl:grid-cols-3 grid-cols-1 items-start gap-8 transition-opacity",
            isPending && "opacity-60",
          )}
        >
          {/* The list scrolls on its own beside the detail once there is
              room for both; on a phone it sits above the detail. */}
          <ul
            aria-label="Makes"
            className="flex @3xl:max-h-screen max-h-96 flex-col @3xl:overflow-y-auto overflow-y-auto border-separator border-t"
          >
            {shown.map((card) => (
              <li key={card.slug}>
                <MakeRowLink
                  card={card}
                  onClick={select(card)}
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
        <ul
          aria-busy={isPending}
          className={cn(
            "grid @3xl:grid-cols-3 @5xl:grid-cols-4 @7xl:grid-cols-5 @md:grid-cols-2 grid-cols-1 gap-2.5 transition-opacity",
            isPending && "opacity-60",
          )}
        >
          {shown.map((card) => (
            <li key={card.slug}>
              <MakeCardLink card={card} onClick={select(card)} />
            </li>
          ))}
        </ul>
      ) : null}

      {shown.length === 0 ? (
        <Typography.Paragraph color="muted" size="sm">
          No make matches “{query}”. Try part of the name, such as “Merc”.
        </Typography.Paragraph>
      ) : null}
    </>
  );
}

/** One line of the list beside the detail: rank, logo, name and count. */
function MakeRowLink({
  card,
  onClick,
  selected,
}: {
  card: MakeCard;
  onClick: (event: MouseEvent) => void;
  selected: boolean;
}) {
  return (
    <Link
      aria-current={selected ? "true" : undefined}
      className={cn(
        "flex min-w-0 items-center gap-2.5 px-2 py-2 text-sm transition-colors hover:bg-surface-secondary",
        selected && "bg-surface-secondary font-semibold",
      )}
      href={card.href}
      onClick={onClick}
      prefetch={false}
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

function MakeCardLink({
  card,
  onClick,
}: {
  card: MakeCard;
  onClick: (event: MouseEvent) => void;
}) {
  const peak = Math.max(...card.trend, 1);

  return (
    // A click selects the make in place, so the make's page is rarely where
    // this leads and is not worth prefetching for every card.
    <Link
      className="flex h-full min-w-0 flex-col gap-2.5 rounded-lg border border-separator bg-surface p-3.5 transition-colors hover:border-border hover:bg-surface-secondary"
      href={card.href}
      onClick={onClick}
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
            className="flex-1 rounded-t-xs"
            // biome-ignore lint/suspicious/noArrayIndexKey: a month's position is its identity
            key={index}
            // HeroUI Pro sets --chart-N but no Tailwind colour for it, so
            // there is no bg-chart-N utility to use here.
            style={{
              backgroundColor:
                index === card.trend.length - 1
                  ? "var(--chart-1)"
                  : "var(--chart-5)",
              height: `${Math.max((value / peak) * 100, 2)}%`,
            }}
          />
        ))}
      </span>
    </Link>
  );
}
