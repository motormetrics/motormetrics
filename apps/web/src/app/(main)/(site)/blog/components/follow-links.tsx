import { Typography } from "@heroui/react";
import type { SelectPost } from "@motormetrics/database/schema";
import {
  formatCurrency,
  formatNumber,
} from "@motormetrics/utils/format-currency";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { formatOrdinal } from "@motormetrics/utils/format-ordinal";
import { InkPanel } from "@web/components/shared/bento";
import { getEvLatestSummary } from "@web/queries/cars/electric-vehicles";
import { getMonthlyRegistrationTotals } from "@web/queries/cars/monthly-registrations";
import { getLatestCoeResults } from "@web/queries/coe/latest-results";
import { getPqpRates } from "@web/queries/coe/pqp/rates";
import { getDeregistrationsTotalByMonth } from "@web/queries/deregistrations/by-category";
import { getDeregistrationsLatestMonth } from "@web/queries/deregistrations/latest-month";
import type { Route } from "next";
import Link from "next/link";
import type { PostCategoryKey } from "./post/utils";
import { type QuickStat, StatPopover } from "./stat-popover";

interface FollowLink {
  href: Route;
  label: string;
}

const DEFAULT_LINKS: FollowLink[] = [
  { href: "/cars", label: "Car registrations" },
  { href: "/coe", label: "COE premiums" },
];

/**
 * The dashboard pages carrying the live figures behind each kind of post.
 * A post quotes one month; these are where the reader checks the latest.
 */
const LINKS_BY_CATEGORY: Record<PostCategoryKey, FollowLink[]> = {
  cars: [
    { href: "/cars/registrations", label: "Car registrations" },
    { href: "/cars/makes", label: "Makes" },
    { href: "/cars/fuel-types", label: "Fuel types" },
  ],
  coe: [
    { href: "/coe/premiums", label: "COE premiums" },
    { href: "/coe/results", label: "Bidding results" },
    { href: "/coe/pqp", label: "PQP rates" },
  ],
  deregistrations: [
    { href: "/cars/deregistrations", label: "Deregistrations" },
    { href: "/coe/pqp", label: "PQP rates" },
    { href: "/cars/parf", label: "PARF calculator" },
  ],
  "electric-vehicles": [
    { href: "/cars/electric-vehicles", label: "Electric vehicles" },
    { href: "/cars/fuel-types", label: "Fuel types" },
    { href: "/cars/makes", label: "Makes" },
  ],
  "monthly-update": [
    { href: "/cars/registrations", label: "Car registrations" },
    { href: "/coe/premiums", label: "COE premiums" },
    { href: "/cars/electric-vehicles", label: "Electric vehicles" },
  ],
  pqp: [
    { href: "/coe/pqp", label: "PQP rates" },
    { href: "/coe/premiums", label: "COE premiums" },
    { href: "/cars/deregistrations", label: "Deregistrations" },
  ],
};

const registrationsStat = async (): Promise<QuickStat | null> => {
  const [previous, latest] = await getMonthlyRegistrationTotals(2);
  if (!latest) {
    return null;
  }
  const change = previous ? latest.total - previous.total : null;
  return {
    heading: "Latest registrations",
    period: formatDateToMonthYear(latest.month),
    rows: [
      { label: "Registered", value: formatNumber(latest.total) },
      ...(change === null
        ? []
        : [
            {
              label: "vs previous month",
              value: `${change >= 0 ? "+" : "−"}${formatNumber(Math.abs(change))}`,
            },
          ]),
    ],
  };
};

const coeStat = async (): Promise<QuickStat | null> => {
  const results = await getLatestCoeResults();
  const [first] = results;
  if (!first) {
    return null;
  }
  return {
    heading: "Latest COE premiums",
    period: `${formatDateToMonthYear(first.month)} · ${formatOrdinal(first.biddingNo)} bidding`,
    rows: results.map((result) => ({
      label: result.vehicleClass,
      value: formatCurrency(result.premium),
    })),
  };
};

const pqpStat = async (): Promise<QuickStat | null> => {
  const rates = await getPqpRates();
  const [month] = Object.keys(rates);
  if (!month) {
    return null;
  }
  return {
    heading: "Latest PQP rates",
    period: formatDateToMonthYear(month),
    rows: Object.entries(rates[month]).map(([category, rate]) => ({
      label: category,
      value: formatCurrency(rate),
    })),
  };
};

const evStat = async (): Promise<QuickStat | null> => {
  const summary = await getEvLatestSummary();
  if (!summary) {
    return null;
  }
  return {
    heading: "Latest electrified registrations",
    period: formatDateToMonthYear(summary.month),
    rows: [
      { label: "Battery electric", value: formatNumber(summary.bevCount) },
      { label: "Electrified", value: formatNumber(summary.totalEv) },
      {
        label: "Electrified share",
        value: `${summary.evSharePercent.toFixed(1)}%`,
      },
      { label: "Top make", value: summary.topMake },
    ],
  };
};

const deregistrationsStat = async (): Promise<QuickStat | null> => {
  const latest = await getDeregistrationsLatestMonth();
  if (!latest?.month) {
    return null;
  }
  const [total] = await getDeregistrationsTotalByMonth(latest.month);
  return {
    heading: "Latest deregistrations",
    period: formatDateToMonthYear(latest.month),
    rows: [{ label: "Deregistered", value: formatNumber(total?.total ?? 0) }],
  };
};

/** The live figure each dashboard link points at, where there is one to show. */
const STAT_BY_HREF: Partial<Record<Route, () => Promise<QuickStat | null>>> = {
  "/cars": registrationsStat,
  "/cars/registrations": registrationsStat,
  "/cars/makes": registrationsStat,
  "/cars/fuel-types": registrationsStat,
  "/cars/electric-vehicles": evStat,
  "/cars/deregistrations": deregistrationsStat,
  "/coe": coeStat,
  "/coe/premiums": coeStat,
  "/coe/results": coeStat,
  "/coe/pqp": pqpStat,
};

/** The comp's closing rail block: "Follow the figures". */
export async function FollowLinks({ post }: { post: SelectPost }) {
  const links =
    LINKS_BY_CATEGORY[post.dataType as PostCategoryKey] ?? DEFAULT_LINKS;

  const stats = await Promise.all(
    links.map((link) => STAT_BY_HREF[link.href]?.() ?? null),
  );

  return (
    <InkPanel className="rounded-2xl">
      <Typography.Paragraph className="text-accent-foreground/85">
        Follow the figures
      </Typography.Paragraph>
      {links.map(({ href, label }, index) => {
        const stat = stats[index];
        return (
          <div className="flex items-center justify-between gap-3" key={href}>
            <Link
              className="font-bold text-accent-on-dark text-sm no-underline transition-colors hover:text-accent-foreground"
              href={href}
            >
              {label} →
            </Link>
            {stat ? <StatPopover label={label} stat={stat} /> : null}
          </div>
        );
      })}
    </InkPanel>
  );
}
