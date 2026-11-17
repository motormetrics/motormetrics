"use client";

import { Typography } from "@heroui/react";
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
import { SourceNote } from "@web/components/shared/overview";
import type { Pqp } from "@web/types/coe";
import { format, parseISO } from "date-fns";
import { TriangleAlert } from "lucide-react";

const monthName = (month: string, pattern: string) =>
  format(parseISO(`${month}-01`), pattern);
const dayLabel = (date: Date) => format(date, "d MMM yyyy");

/**
 * What the calculator's inputs come to: the PQP for the expiry month and when
 * renewing pays it, then three figures side by side — a year of each renewal
 * term and what deregistering returns. Figures only; there is no verdict.
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

  const options = [
    ...(history.mustDeregister
      ? []
      : costs.map((cost) => ({
          caption: "PQP to pay",
          label: `Renew for ${cost.term} years`,
          value: cost.payment,
        }))),
    {
      caption: "PARF rebate back",
      label: `Deregister by ${expiryLabel}`,
      value: rebate.amount,
    },
  ];

  return (
    <div aria-live="polite" className="flex flex-col gap-6">
      <span className="text-muted text-sm">
        {category.replace("Category", "Cat")} PQP for{" "}
        {monthName(pqp.month, "MMMM yyyy")}
        {pqp.estimated && latestMonth
          ? `, estimated from the ${monthName(latestMonth, "MMMM")} rate`
          : ""}
      </span>

      {history.mustDeregister ? (
        <div
          className="flex items-start gap-2 rounded-2xl bg-warning-soft p-4 text-sm text-warning-soft-foreground"
          role="status"
        >
          <TriangleAlert aria-hidden className="size-5 shrink-0" />A 5-year
          renewal is final. LTA requires this car to be deregistered by{" "}
          {expiryLabel}.
        </div>
      ) : null}

      <dl
        className={
          options.length > 1
            ? "grid grid-cols-1 divide-y divide-separator sm:grid-cols-3 sm:divide-x sm:divide-y-0"
            : "grid grid-cols-1"
        }
      >
        {options.map(({ caption, label, value }) => (
          <div
            className="flex flex-col gap-1 py-4 first:pt-0 last:pb-0 sm:px-6 sm:py-0 sm:last:pr-0 sm:first:pl-0"
            key={label}
          >
            <dt className="font-medium text-sm">{label}</dt>
            <dd className="font-bold text-3xl tabular-nums tracking-tight">
              {formatCurrency(value)}
            </dd>
            <dd className="text-muted text-xs">{caption}</dd>
          </div>
        ))}
      </dl>

      {history.mustDeregister ? null : (
        <Typography.Paragraph size="sm">
          Renew from the 3rd week of {monthName(windows.earlyPqpMonth, "MMMM")}{" "}
          to {expiryLabel} to pay this PQP.
        </Typography.Paragraph>
      )}

      <TableDisclosure title="How this is worked out">
        {history.mustDeregister ? null : (
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="text-muted text-xs">
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
                  className={
                    row.label === "Total" ? "font-semibold" : undefined
                  }
                  key={row.label}
                >
                  <th className="py-2 text-left font-normal" scope="row">
                    {row.label}
                  </th>
                  <td className="py-2 text-right">{formatCurrency(row.ten)}</td>
                  <td className="py-2 text-right">
                    {formatCurrency(row.five)}
                  </td>
                </tr>
              ))}
              <tr className="text-muted">
                <th className="py-2 text-left font-normal" scope="row">
                  A year, all in
                </th>
                <td className="py-2 text-right">
                  {formatCurrency(ten.perYear)}
                </td>
                <td className="py-2 text-right">
                  {formatCurrency(five.perYear)}
                </td>
              </tr>
            </tbody>
          </table>
        )}
        <ul className="flex list-disc flex-col gap-1 pl-6 text-foreground text-sm">
          <li>
            Renew before the 3rd week of{" "}
            {monthName(windows.earlyPqpMonth, "MMMM")} and you pay the{" "}
            {earlyShort} PQP and lose unused COE days. Renew late, up to{" "}
            {lateLabel}, and you pay a $50–$250 fee.
          </li>
          <li>
            {history.renewedBefore
              ? "The PARF rebate was given up at the last renewal."
              : `The PARF rebate is ${Math.round(rebate.rate * 100)}% of the ARF${rebate.capped ? `, capped at ${formatCurrency(rebate.cap)}` : ""}, and renewing gives it up.`}
          </li>
          <li>
            Road tax follows LTA's formula for your fuel type, with the 10% to
            50% surcharge for cars over 10 years old. Electric cars include the
            Additional Flat Component. Diesel assumes a Euro V or newer engine.
            Diesel-electric cars aren't covered.
          </li>
          <li>
            Repairs, fuel, insurance and parking are left out. A 5-year renewal
            can't be renewed again.
          </li>
        </ul>
        <SourceNote>
          MotorMetrics is not affiliated with LTA; check figures on{" "}
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
      </TableDisclosure>
    </div>
  );
}
