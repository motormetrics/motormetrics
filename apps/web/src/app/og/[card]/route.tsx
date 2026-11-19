import { Article } from "@web/lib/og/cards/article";
import { OG_CACHE_HEADERS, OG_SIZE } from "@web/lib/og/config";
import { getOGFonts } from "@web/lib/og/fonts";
import { ImageResponse } from "next/og";

/**
 * The section share cards, keyed by the file name in their URL: one per
 * section, shared by its index and detail pages. The copy is fixed, so each
 * card is drawn once at build time and follows the shared frame from then on.
 * `@web/lib/metadata/social` names these URLs.
 */
const CARDS: Record<string, { excerpt: string; tag: string; title: string }> = {
  "makes.png": {
    excerpt:
      "Monthly registrations, market share and fuel mix for every car make in Singapore.",
    tag: "Car makes",
    title: "New car registrations by make",
  },
  "compare-makes.png": {
    excerpt:
      "Registrations, market share and fuel mix for any two makes, such as BMW and Mercedes-Benz.",
    tag: "Compare makes",
    title: "Compare car makes side by side",
  },
  "learn.png": {
    excerpt:
      "COE, PARF, ARF and the costs behind every car, explained plainly.",
    tag: "Learn",
    title: "Guides to buying and owning a car in Singapore",
  },
};

export function generateStaticParams() {
  return Object.keys(CARDS).map((card) => ({ card }));
}

export async function GET(
  _request: Request,
  { params }: RouteContext<"/og/[card]">,
) {
  const { card } = await params;
  const copy = CARDS[card];

  if (!copy) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(
    <Article byline="" height={OG_SIZE.height} {...copy} />,
    {
      ...OG_SIZE,
      fonts: await getOGFonts(),
      headers: OG_CACHE_HEADERS,
    },
  );
}
