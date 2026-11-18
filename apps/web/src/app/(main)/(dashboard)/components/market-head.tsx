import { Typography } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  batteryElectricShares,
  resolveMonthIndex,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import { toCategoryKey } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  exerciseName,
  signed,
} from "@web/app/(main)/(dashboard)/components/market-copy";
import { windowEndingAt } from "@web/app/(main)/(dashboard)/components/overview-series";
import {
  type KeyNumber,
  KeyNumberItem,
} from "@web/components/shared/key-numbers";
import { SourceNote } from "@web/components/shared/overview";
import {
  getEvMarketShare,
  getEvMonthlyTrend,
  getMonthlyRegistrationTotals,
  getYearToDateByFuelType,
} from "@web/queries/cars";
import { getCategoryExercises, getPqpRates } from "@web/queries/coe";
import { changeRatio } from "@web/utils/change-ratio";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";
import { getLatestMonth } from "@web/utils/dates/months";
import Link from "next/link";
import type { ReactNode } from "react";

/** Matches the fuel type figure's query, so both read one cache entry. */
const HISTORY_LIMIT = 24;

/** LTA publishes PQP for these; Category E has none. */
const PQP_CATEGORIES = [
  "Category A",
  "Category B",
  "Category C",
  "Category D",
] as const;

/** The 5-year renewal is half the PQP, and only cars (A and B) may take it. */
const FIVE_YEAR_CATEGORIES = new Set<string>(["Category A", "Category B"]);

/**
 * The line under the title: how far each dataset runs, e.g. "COE to the first
 * bidding, November 2026 · Registrations to October 2026".
 */
export async function MarketAsOf() {
  const [month, categoryA] = await Promise.all([
    getLatestMonth("cars"),
    getCategoryExercises("Category A"),
  ]);
  const latest = categoryA.at(-1);

  return (
    <>
      {latest ? `COE to the ${exerciseName(latest)} · ` : ""}
      Registrations to {formatMonthLabel(month)}
    </>
  );
}

/**
 * One block of the right sidebar's key figures: a heading with its period,
 * the ruled figures and the links to the pages that carry the full data.
 */
function RailBlock({
  id,
  items,
  links,
  note,
  period,
  title,
}: {
  id: string;
  items: (KeyNumber & { key: string })[];
  links: { href: string; label: string }[];
  note?: ReactNode;
  period: string;
  title: string;
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-2">
      <Typography.Heading className="text-base" id={id} level={2}>
        {title} <span className="font-normal text-muted">{period}</span>
      </Typography.Heading>
      <dl className="flex flex-col divide-y divide-separator border-separator border-y">
        {items.map(({ key, ...item }) => (
          <KeyNumberItem key={key} {...item} />
        ))}
      </dl>
      {note ? <SourceNote>{note}</SourceNote> : null}
      <ul className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              className="font-semibold text-accent text-sm no-underline hover:underline"
              href={href}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * The prevailing quota premium for Categories A to D, with the 5-year
 * renewal for the two car categories. First in the sidebar because /coe/pqp
 * is the site's top page by search impressions.
 */
export async function PqpKeyNumbers() {
  const rates = await getPqpRates();
  const [month, previousMonth] = Object.keys(rates).sort().reverse();
  if (!month) {
    return null;
  }

  const items = PQP_CATEGORIES.flatMap((category) => {
    const rate = rates[month]?.[category];
    if (rate === undefined) {
      return [];
    }
    const before = previousMonth ? rates[previousMonth]?.[category] : undefined;
    return [
      {
        key: category,
        label: `Category ${toCategoryKey(category)}, 10-year`,
        note: [
          FIVE_YEAR_CATEGORIES.has(category)
            ? `5-year: ${formatCurrency(rate / 2)}`
            : null,
          before !== undefined && previousMonth
            ? `${signed(changeRatio(rate, before) * 100)} on ${formatMonthName(previousMonth)}`
            : null,
        ]
          .filter(Boolean)
          .join(" · "),
        value: formatCurrency(rate),
      },
    ];
  });

  if (items.length === 0) {
    return null;
  }

  return (
    <RailBlock
      id="pqp-heading"
      items={items}
      links={[{ href: "/coe/pqp", label: "PQP rates" }]}
      note="Source: LTA. The 5-year renewal is half the PQP and applies to Categories A and B. LTA publishes no PQP for Category E."
      period={`PQP, ${formatMonthLabel(month)}`}
      title="Renewing a COE"
    />
  );
}

/**
 * The latest month's new cars, the electric share of them and the year so
 * far, with the links to the registration and electric vehicle pages.
 */
export async function NewCarsKeyNumbers() {
  const month = await getLatestMonth("cars");
  const [monthlyTotals, yearToDate, evTrend, evMarketShare] = await Promise.all(
    [
      getMonthlyRegistrationTotals(HISTORY_LIMIT),
      getYearToDateByFuelType(Number(month.slice(0, 4))),
      getEvMonthlyTrend(),
      getEvMarketShare(),
    ],
  );

  const items: (KeyNumber & { key: string })[] = [];

  const registrations = windowEndingAt(monthlyTotals, month, 2);
  const [previousCars, latestCars] =
    registrations.length === 2 ? registrations : [undefined, registrations[0]];
  if (latestCars) {
    items.push({
      key: "registered",
      label: "Registered",
      note: previousCars
        ? `${signed(changeRatio(latestCars.total, previousCars.total) * 100)} on ${formatMonthName(previousCars.month)}`
        : undefined,
      value: latestCars.total.toLocaleString("en-SG"),
    });
  }

  const evIndex = resolveMonthIndex(
    evTrend.map((point) => point.month),
    month,
  );
  const shares = batteryElectricShares(evTrend, evMarketShare);
  const evShare = evIndex >= 0 ? shares[evIndex] : undefined;
  if (evShare !== undefined) {
    const before = evIndex > 0 ? shares[evIndex - 1] : undefined;
    items.push({
      key: "electric",
      label: "Electric",
      note:
        before !== undefined
          ? `${signed(evShare - before, " pts")} on ${formatMonthName(evTrend[evIndex - 1].month)}`
          : "of new cars",
      value: `${evShare.toFixed(1)}%`,
    });
  }

  const yearTotal = yearToDate.reduce((sum, row) => sum + row.count, 0);
  if (yearTotal > 0) {
    items.push({
      key: "year-to-date",
      label: `${month.slice(0, 4)} to date`,
      note:
        month.slice(5) === "01"
          ? "January"
          : `January to ${formatMonthName(month)}`,
      value: yearTotal.toLocaleString("en-SG"),
    });
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <RailBlock
      id="new-cars-heading"
      items={items}
      links={[
        { href: "/cars", label: "New registrations" },
        { href: "/cars/electric-vehicles", label: "Electric vehicles" },
      ]}
      period={formatMonthLabel(latestCars?.month ?? month)}
      title="New cars"
    />
  );
}
