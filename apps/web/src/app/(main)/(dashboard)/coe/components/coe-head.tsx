import { Typography } from "@heroui/react";
import {
  formatExercise,
  nextExercise,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  CoeHeroSelected,
  CoeHeroView,
  CoeKeyNumbersSelected,
  CoeKeyNumbersView,
} from "@web/app/(main)/(dashboard)/coe/components/coe-head-view";
import { loadCoeOverview } from "@web/app/(main)/(dashboard)/coe/components/overview-loader";
import { coeOverviewSearchParams } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { Suspense } from "react";

const DEFAULT_CATEGORY = coeOverviewSearchParams.category.defaultValue;

/** The sections the key numbers jump to. */
const JUMP_LINKS = [
  { href: "#coe-history", label: "Premium by exercise" },
  { href: "#coe-pqp", label: "PQP renewal rates" },
  { href: "#coe-all", label: "All categories and demand" },
];

/** " · First bidding, November 2026", after the head's eyebrow. */
export async function CoeExerciseName() {
  const data = await loadCoeOverview();

  return data ? ` · ${formatExercise(data.latest)}` : null;
}

/**
 * The hero and lead. The figures for every category are shaped here, in the
 * static shell; the fallback draws the default category so the shell holds
 * real figures, and the client view swaps in the category in the URL.
 */
export async function CoeHero() {
  const data = await loadCoeOverview();

  if (!data) {
    return null;
  }

  return (
    <>
      <Suspense
        fallback={<CoeHeroView categoryKey={DEFAULT_CATEGORY} data={data} />}
      >
        <CoeHeroSelected data={data} />
      </Suspense>
      <Typography.Paragraph color="muted" size="sm">
        Source: LTA via DataMall. Next exercise:{" "}
        {formatExercise(nextExercise(data.latest)).toLowerCase()}, closes 16:00.
      </Typography.Paragraph>
    </>
  );
}

/** The key numbers beside the head, which also choose the category. */
export async function CoeKeyNumbers() {
  const data = await loadCoeOverview();

  if (!data) {
    return null;
  }

  return (
    <aside aria-label="Key numbers" className="flex flex-col gap-3">
      <Typography.Paragraph
        className="uppercase"
        color="muted"
        size="xs"
        weight="semibold"
      >
        Key numbers · choose a category
      </Typography.Paragraph>
      <Suspense
        fallback={
          <CoeKeyNumbersView categoryKey={DEFAULT_CATEGORY} data={data} />
        }
      >
        <CoeKeyNumbersSelected data={data} />
      </Suspense>
      <nav aria-label="On this page">
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
          {JUMP_LINKS.map(({ href, label }) => (
            <li key={href}>
              <a
                className="text-accent-strong hover:text-accent-deep"
                href={href}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <Typography.Paragraph color="muted" size="xs">
        Source: LTA via DataMall.
      </Typography.Paragraph>
    </aside>
  );
}
