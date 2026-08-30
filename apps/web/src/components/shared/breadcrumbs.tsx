"use client";

import {
  ADVERTISE_MORE_ITEM,
  BLOG_MORE_ITEM,
  MORE_NAV_ITEMS,
  PRIMARY_NAV_ITEMS,
} from "@web/config/navigation";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Labels the nav already has, keyed by href, so a crumb reads "Electric"
 * rather than "Electric vehicles" wherever the nav made that choice.
 */
const LABELS_BY_HREF: Record<string, string> = {
  ...Object.fromEntries(
    PRIMARY_NAV_ITEMS.flatMap(({ href, items, label }) => [
      [href, label] as const,
      ...(items ?? []).map(({ title, url }) => [url, title] as const),
    ]),
  ),
  ...Object.fromEntries(MORE_NAV_ITEMS.map(({ title, url }) => [url, title])),
  [ADVERTISE_MORE_ITEM.url]: ADVERTISE_MORE_ITEM.title,
  [BLOG_MORE_ITEM.url]: BLOG_MORE_ITEM.title,
};

/** "electric-vehicles" -> "Electric vehicles"; also covers `[make]` values. */
function titleiseSegment(segment: string): string {
  const spaced = decodeURIComponent(segment).replace(/-/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * The comps open every page with `Home / Cars / Makes`. The trail is derived
 * from the path rather than passed in, so a page picks it up by rendering
 * PageHead and nothing has to be threaded through eighteen call sites.
 */
export function Breadcrumbs() {
  const pathname = usePathname();

  const segments = pathname.split("/").filter(Boolean);
  const crumbs = [
    { href: "/", label: "Home" },
    ...segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`;
      return { href, label: LABELS_BY_HREF[href] ?? titleiseSegment(segment) };
    }),
  ];

  const lastIndex = crumbs.length - 1;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2">
        {crumbs.map(({ href, label }, index) => (
          <li className="flex items-center gap-2" key={href}>
            {index > 0 ? (
              <span aria-hidden className="text-muted text-sm">
                /
              </span>
            ) : null}
            {index === lastIndex ? (
              <span
                aria-current="page"
                className="font-semibold text-muted text-sm"
              >
                {label}
              </span>
            ) : (
              <Link
                className="font-medium text-muted text-sm transition-colors hover:text-foreground"
                href={href as Route}
              >
                {label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
