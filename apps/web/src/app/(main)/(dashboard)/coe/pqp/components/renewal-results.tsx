"use client";

import { Chip, cn, Surface, Typography } from "@heroui/react";
import { ChartTooltip } from "@heroui-pro/react";
import { BarChart } from "@heroui-pro/react/bar-chart";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { TableDisclosure } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/disclosure";
import {
  getApplicablePqp,
  getRenewalCost,
  getRenewalWindows,
  type ParfRebate,
  type RenewalCategory,
  type VehicleHistory,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/renewal";
import type { RoadTaxInput } from "@web/app/(main)/(dashboard)/coe/pqp/components/road-tax";
import { SectionLink, SourceNote } from "@web/components/shared/overview";
import type { Pqp } from "@web/types/coe";
import { compactCurrency } from "@web/utils/formatting/chart-axis";
import { format, parseISO } from "date-fns";
import { CircleDollarSign, TriangleAlert } from "lucide-react";

/** The three parts of a year's renewal cost, in the order they stack. */
const PARTS = [
  { color: "var(--chart-1)", key: "pqp", label: "PQP", swatch: "bg-chart-1" },
  {
    color: "var(--chart-3)",
    key: "parf",
    label: "PARF rebate given up",
    swatch: "bg-chart-3",
  },
  {
    color: "var(--chart-5)",
    key: "tax",
    label: "Road tax, with age surcharge",
    swatch: "bg-chart-5",
  },
] as const;

interface CostRow {
  [key: string]: number | string;
  label: string;
  parf: number;
  pqp: number;
  tax: number;
}

const monthName = (month: string, pattern: string) =>
  format(parseISO(`${month}-01`), pattern);
const dayLabel = (date: Date) => format(date, "d MMM yyyy");

/**
 * What the calculator's inputs come to: the PQP for the expiry month, when
 * renewing pays which PQP, the estimated cost a year of each term, and what
 * deregistering returns instead. Figures only; there is no verdict.
 */
export function RenewalResults({
  category,
  expiry,
  history,
  rates,
  rebate,
  roadTax,
}: {
  category: RenewalCategory;
  expiry: Date;
  history: VehicleHistory;
  rates: Pqp.TrendPoint[];
  rebate: ParfRebate;
  roadTax: RoadTaxInput;
}) {
  const pqp = getApplicablePqp(expiry, category, rates);
  const windows = getRenewalWindows(expiry);
  const latestMonth = rates
    .map((point) => point.month)
    .sort()
    .at(-1);
  const expiryMonth = format(expiry, "yyyy-MM");
  const expiryLabel = dayLabel(windows.expiry);
  const lateLabel = dayLabel(windows.lateUntil);
  const earlyShort = monthName(windows.earlyPqpMonth, "MMM");

  if (!pqp) {
    return (
      <Typography.Paragraph color="muted">
        No PQP was published for {monthName(expiryMonth, "MMMM yyyy")}.
      </Typography.Paragraph>
    );
  }

  const costs = ([10, 5] as const).map((term) =>
    getRenewalCost({
      ageAtExpiry: history.ageAtExpiry,
      parfForgone: rebate.amount,
      pqp: pqp.rate,
      roadTax,
      term,
    }),
  );
  const [ten, five] = costs;
  const rows: CostRow[] = costs.map((cost) => ({
    label: `${cost.term} years`,
    parf: cost.parfForgone / cost.term,
    pqp: cost.payment / cost.term,
    tax: (cost.roadTax + cost.roadTaxSurcharge + cost.roadTaxExtra) / cost.term,
  }));
  const extraLabel =
    roadTax.fuel === "electric"
      ? "Additional Flat Component"
      : "Diesel special tax";
  const breakdown = [
    { five: five.payment, label: "PQP, paid now", ten: ten.payment },
    {
      five: five.parfForgone,
      label: "PARF rebate given up",
      ten: ten.parfForgone,
    },
    { five: five.roadTax, label: "Road tax", ten: ten.roadTax },
    {
      five: five.roadTaxSurcharge,
      label: "Road tax age surcharge",
      ten: ten.roadTaxSurcharge,
    },
    ...(ten.roadTaxExtra > 0
      ? [{ five: five.roadTaxExtra, label: extraLabel, ten: ten.roadTaxExtra }]
      : []),
    { five: five.total, label: "Total", ten: ten.total },
  ];

  return (
    <div aria-live="polite" className="flex flex-col gap-6">
      <Surface
        className="flex flex-col gap-5 rounded-3xl bg-foreground p-6"
        variant="transparent"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-accent-foreground/85 text-sm">
              Your PQP · {category.replace("Category", "Cat")} ·{" "}
              {monthName(pqp.month, "MMMM yyyy")}
            </span>
            <span className="font-extrabold text-4xl text-accent-foreground tabular-nums tracking-tight">
              {formatCurrency(pqp.rate)}
            </span>
          </div>
          <Chip color={pqp.estimated ? "warning" : "accent"} variant="soft">
            {pqp.estimated && latestMonth
              ? `Estimate · using ${monthName(latestMonth, "MMM")} rate`
              : "Published by LTA"}
          </Chip>
        </div>
        <figure className="flex flex-col gap-2">
          <figcaption className="text-accent-foreground/85 text-sm">
            Which PQP you pay depends on when you renew
          </figcaption>
          <div
            aria-label={`Renew before the 3rd week of ${monthName(windows.earlyPqpMonth, "MMMM")} and you pay the ${monthName(windows.earlyPqpMonth, "MMMM")} PQP and lose unused COE days. From then to ${expiryLabel} you pay the ${monthName(expiryMonth, "MMMM")} PQP. Up to ${lateLabel} you pay it plus a late fee.`}
            className="grid h-2 grid-cols-3 gap-1"
            role="img"
          >
            <span className="rounded-full bg-accent-foreground/30" />
            <span className="rounded-full bg-accent-on-dark" />
            <span className="rounded-full bg-warning" />
          </div>
          <div className="grid grid-cols-3 gap-1 text-xs">
            {[
              ["Early", `${earlyShort} PQP, lose unused days`],
              [
                `3rd wk ${earlyShort} – ${expiryLabel}`,
                `${monthName(expiryMonth, "MMM")} PQP`,
              ],
              [`Late, to ${lateLabel}`, "+ $50–$250 fee"],
            ].map(([when, what]) => (
              <span className="flex flex-col" key={when}>
                <span className="font-semibold text-accent-foreground">
                  {when}
                </span>
                <span className="text-accent-foreground/70">{what}</span>
              </span>
            ))}
          </div>
        </figure>
      </Surface>

      {history.mustDeregister ? (
        <div
          className="flex items-start gap-3 rounded-2xl bg-warning-soft p-4 text-sm text-warning-soft-foreground"
          role="status"
        >
          <TriangleAlert aria-hidden className="mt-0.5 size-5 shrink-0" />A
          5-year renewal is final. LTA requires this car to be deregistered by{" "}
          {expiryLabel}.
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-3">
        {history.mustDeregister ? null : (
          <figure className="flex min-w-0 flex-col gap-3 xl:col-span-2">
            <figcaption className="flex flex-col gap-1">
              <span className="font-semibold">
                Estimated renewal cost a year
              </span>
              <span className="text-muted text-sm">
                PQP, the PARF rebate you give up and road tax, spread over each
                term
              </span>
            </figcaption>
            <dl className="grid grid-cols-2 gap-3">
              {costs.map((cost) => (
                <div className="flex flex-col" key={cost.term}>
                  <dt className="text-muted text-xs">
                    Renew for {cost.term} years
                  </dt>
                  <dd className="flex items-baseline gap-2 tabular-nums">
                    <span className="font-bold text-xl">
                      {formatCurrency(cost.perYear)}
                    </span>
                    <span className="text-muted text-sm">
                      {formatCurrency(cost.perMonth)}/mo
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
            <BarChart
              data={rows}
              height={rows.length * 56 + 28}
              layout="vertical"
              margin={{ bottom: 0, left: 0, right: 16, top: 0 }}
            >
              <BarChart.Grid horizontal={false} />
              <BarChart.XAxis tickFormatter={compactCurrency} type="number" />
              <BarChart.YAxis
                dataKey="label"
                tickMargin={8}
                type="category"
                width={64}
              />
              {PARTS.map(({ color, key }) => (
                <BarChart.Bar
                  barSize={18}
                  dataKey={key}
                  fill={color}
                  key={key}
                  stackId="cost"
                />
              ))}
              <BarChart.Tooltip
                content={({ active, payload }) => {
                  const row = payload?.[0]?.payload as CostRow | undefined;
                  if (!active || !row) {
                    return null;
                  }
                  return (
                    <ChartTooltip>
                      <ChartTooltip.Header>{row.label}</ChartTooltip.Header>
                      {PARTS.map(({ color, key, label }) => (
                        <ChartTooltip.Item key={key}>
                          <ChartTooltip.Indicator color={color} />
                          <ChartTooltip.Label>{label}</ChartTooltip.Label>
                          <ChartTooltip.Value>
                            {formatCurrency(row[key])} a year
                          </ChartTooltip.Value>
                        </ChartTooltip.Item>
                      ))}
                    </ChartTooltip>
                  );
                }}
              />
            </BarChart>
            <ul
              aria-label="Legend"
              className="flex flex-wrap gap-4 text-muted-strong text-sm"
            >
              {PARTS.map(({ key, label, swatch }) => (
                <li className="inline-flex items-center gap-1.5" key={key}>
                  <span
                    aria-hidden
                    className={cn("block h-2.5 w-3 rounded-xs", swatch)}
                  />
                  {label}
                </li>
              ))}
            </ul>
            <TableDisclosure title="Breakdown in dollars">
              <table className="w-full text-sm tabular-nums">
                <thead>
                  <tr className="border-border border-b text-muted text-xs">
                    <th scope="col" />
                    <th className="py-2 text-right" scope="col">
                      10 years
                    </th>
                    <th className="py-2 text-right" scope="col">
                      5 years
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((row) => (
                    <tr
                      className="border-separator border-b last:font-bold"
                      key={row.label}
                    >
                      <th className="py-2 text-left font-medium" scope="row">
                        {row.label}
                      </th>
                      <td className="py-2 text-right">
                        {formatCurrency(row.ten)}
                      </td>
                      <td className="py-2 text-right">
                        {formatCurrency(row.five)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableDisclosure>
          </figure>
        )}

        <div className="flex flex-col gap-3 self-start rounded-3xl bg-surface p-5">
          <span className="flex items-center gap-2 font-semibold">
            <CircleDollarSign aria-hidden className="size-5 text-accent" />
            If you deregister
          </span>
          <div className="flex flex-col gap-1">
            <span className="text-muted text-xs">Estimated back</span>
            <span className="font-bold text-3xl tabular-nums">
              {formatCurrency(rebate.amount)}
            </span>
            <span className="text-muted text-sm">
              {history.renewedBefore
                ? "PARF was given up at the last renewal"
                : `PARF rebate, ${Math.round(rebate.rate * 100)}% of ARF${rebate.capped ? `, capped at ${formatCurrency(rebate.cap)}` : ""}`}
            </span>
          </div>
          <span className="text-muted-strong text-sm">By {expiryLabel}</span>
          <SectionLink className="ml-0" href="/cars/arf">
            Compare a new car
          </SectionLink>
        </div>
      </div>

      <div
        className="flex flex-col gap-2 border-border border-t pt-4"
        role="note"
      >
        <span className="font-semibold text-sm">
          These are renewal costs only.
        </span>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-muted-strong text-sm">
          <li>
            Road tax follows LTA's formula for your fuel type, with the 10% to
            50% surcharge for cars over 10 years old applied to road tax only.
            Electric cars include the Additional Flat Component. Diesel assumes
            a Euro V or newer engine. Diesel-electric cars aren't covered.
          </li>
          <li>Repairs aren't included, and they tend to rise as a car ages.</li>
          <li>
            Fuel, insurance and parking are left out, as any car has them.
          </li>
          <li>A 5-year renewal can't be renewed again.</li>
        </ul>
        <SourceNote>
          Estimates only, not a recommendation. MotorMetrics is not affiliated
          with LTA; check figures on{" "}
          <a
            className="underline"
            href="https://onemotoring.lta.gov.sg/content/onemotoring/home/owning/coe-renewal.html"
            rel="noopener noreferrer nofollow"
            target="_blank"
          >
            OneMotoring
          </a>
          .
        </SourceNote>
      </div>
    </div>
  );
}
