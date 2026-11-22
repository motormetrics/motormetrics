import CarMakesPage from "@web/app/(main)/(dashboard)/cars/makes/page";

export { metadata } from "@web/app/(main)/(dashboard)/cars/makes/page";

/**
 * The Makes page with no filters set, rendered whole at build time.
 *
 * `/cars/makes` reads its search params, so every request to it ran the
 * function even when the CDN had the page. A rewrite in `next.config.ts` sends
 * requests that carry none of the page's params here instead, so the default
 * view, which is what crawlers and most first visits ask for, is served from
 * the CDN alone. Filtered URLs still reach `/cars/makes`.
 */
export default function CarMakesDefaultPage() {
  return <CarMakesPage searchParams={Promise.resolve({})} />;
}
