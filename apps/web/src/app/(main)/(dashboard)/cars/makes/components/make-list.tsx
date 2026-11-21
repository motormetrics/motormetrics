"use client";

import { SearchField, Typography } from "@heroui/react";
import { serializeCompareSearchParams } from "@web/app/(main)/(dashboard)/cars/makes/compare/search-params";
import {
  BarHeader,
  BarRow,
} from "@web/app/(main)/(dashboard)/cars/makes/components/bar-row";
import { SortSwitch } from "@web/app/(main)/(dashboard)/cars/makes/components/makes-filters";
import { NavButton } from "@web/app/(main)/(dashboard)/cars/makes/components/nav-button";
import { makesSearchParams } from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import Link from "next/link";
import { useQueryState } from "nuqs";

export interface MakeListRow {
  /** "+12.3%", or a dash when the change is withheld. */
  change: string;
  count: number;
  /**
   * The selected make's slug while a second make is being picked. The row
   * then opens the comparison of the two through a button, never a link, so
   * crawlers cannot walk every pair.
   */
  compareWith?: string;
  /** The make's own page. */
  href: string;
  logoUrl: string | null;
  make: string;
  slug: string;
}

/**
 * The list's search field. Without `onChange` it is the stand-in the static
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
      aria-label="Find a make"
      className="w-full md:w-72"
      isReadOnly={isReadOnly}
      onChange={onChange}
      value={value}
    >
      <SearchField.Group>
        <SearchField.SearchIcon />
        <SearchField.Input placeholder="Find a make" />
        <SearchField.ClearButton />
      </SearchField.Group>
    </SearchField>
  );
}

/**
 * The ranked list of makes with its search. The search filters what is
 * already in the page as the reader types, so it stays a shallow `?q=` update
 * with no round trip.
 *
 * Every make's name is a plain link to that make's own page, one cached page
 * per make, or a button into the comparison while a second make is being
 * picked. No row links to a filtered view of this page.
 */
export function MakeList({
  changeHeading,
  rows,
}: {
  /** The last column's head: "On 2025", "On a year earlier". */
  changeHeading: string;
  rows: readonly MakeListRow[];
}) {
  const [query, setQuery] = useQueryState("q", makesSearchParams.q);
  const needle = query.trim().toLowerCase();
  const shown = needle
    ? rows.filter(
        (row) =>
          row.make.toLowerCase().includes(needle) || row.slug.includes(needle),
      )
    : rows;
  const leader = Math.max(...rows.map((row) => row.count), 1);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-4">
        <MakeSearchField
          onChange={(value) => setQuery(value || null)}
          value={query}
        />
        <span className="text-muted text-sm tabular-nums" role="status">
          {needle
            ? `${shown.length} of ${rows.length} makes shown`
            : `${rows.length} ${rows.length === 1 ? "make" : "makes"}`}
        </span>
        <div className="flex items-center gap-2 md:ml-auto">
          <span className="font-semibold text-muted text-xs">Sort by</span>
          <SortSwitch />
        </div>
      </div>

      {shown.length > 0 ? (
        <div className="flex flex-col">
          <BarHeader label="Make" trailing={changeHeading} value="Cars" />
          {shown.map((row) => (
            <BarRow
              key={row.slug}
              label={
                <>
                  <MakeAvatar logoUrl={row.logoUrl} make={row.make} size="sm" />
                  {row.compareWith ? (
                    <NavButton
                      aria-label={`Compare with ${row.make}`}
                      // Sized and set like the name links on the other rows,
                      // so the list keeps one column edge and one weight.
                      className="h-auto min-w-0 truncate px-0 font-semibold text-foreground text-sm hover:bg-transparent hover:text-accent hover:underline"
                      action="/cars/makes/compare"
                      serialize={serializeCompareSearchParams}
                      values={{ make: [row.compareWith, row.slug] }}
                      size="sm"
                      variant="ghost"
                    >
                      {row.make}
                    </NavButton>
                  ) : (
                    <Link
                      className="truncate font-semibold text-foreground no-underline hover:text-accent hover:underline"
                      href={row.href}
                      prefetch={false}
                    >
                      {row.make}
                    </Link>
                  )}
                </>
              }
              percent={(row.count / leader) * 100}
              trailing={row.change}
              value={row.count.toLocaleString("en-SG")}
            />
          ))}
        </div>
      ) : (
        <Typography.Paragraph color="muted" size="sm">
          No make matches “{query}”. Try part of the name, such as “Merc”.
        </Typography.Paragraph>
      )}
    </div>
  );
}
