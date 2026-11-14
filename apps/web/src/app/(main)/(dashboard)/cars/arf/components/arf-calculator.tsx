"use client";

import {
  Chip,
  Label,
  ListBox,
  NumberField,
  Select,
  Typography,
} from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { ArfBands } from "@web/app/(main)/(dashboard)/cars/arf/components/arf-bands";
import {
  ARF_SCHEDULES,
  calculateArf,
} from "@web/app/(main)/(dashboard)/cars/arf/components/arf-rates";
import { ArfSchedules } from "@web/app/(main)/(dashboard)/cars/arf/components/arf-schedules";
import { SGD_FORMAT } from "@web/app/(main)/(dashboard)/cars/parf/components/parf-rates";
import { Hairline, SourceNote } from "@web/components/shared/overview";
import posthog from "posthog-js";
import { type ReactNode, useState } from "react";

/** The page's sections, for the jump links under the key numbers. */
const JUMP_LINKS = [
  { href: "#arf-schedules", label: "ARF under each schedule" },
  { href: "#arf-bands", label: "ARF band by band" },
  { href: "#arf-notes", label: "What the figures assume" },
];

const formatRate = (rate: number) => `${Math.round(rate * 100)}%`;

/**
 * Direction D's head for the calculator, laid out as the PARF calculator's so
 * the two tools read as a pair: the page's eyebrow, title and source line
 * (`head`), the two fields, the answer under them, and the key numbers beside
 * the head once the page is wide. The figures beneath read the same state.
 */
export function ARFCalculator({ head }: { head: ReactNode }) {
  const [omv, setOmv] = useState(40_000);
  const [scheduleKey, setScheduleKey] = useState(ARF_SCHEDULES[0].key);

  const schedule =
    ARF_SCHEDULES.find(({ key }) => key === scheduleKey) ?? ARF_SCHEDULES[0];
  const { total, bands } = calculateArf(omv, schedule.tiers);
  const topBand = bands.at(-1);

  const keyNumbers = [
    {
      label: "Effective rate",
      value: omv > 0 ? formatRate(total / omv) : "—",
      note: "ARF as a share of OMV",
    },
    {
      label: "Top band",
      value: topBand ? formatRate(topBand.rate) : "—",
      note: "rate on the last dollar of OMV",
    },
    // The same OMV under the other schedules, so the change reads at once.
    ...ARF_SCHEDULES.filter(({ key }) => key !== schedule.key).map(
      ({ label, tiers }) => {
        const other = calculateArf(omv, tiers).total;
        const difference = total - other;
        return {
          label: `COE obtained ${label}`,
          value: formatCurrency(other),
          note:
            difference === 0
              ? "same as the selected tiers"
              : `${formatCurrency(Math.abs(difference))} ${difference > 0 ? "less" : "more"} than the selected tiers`,
        };
      },
    ),
  ];

  return (
    <>
      <div className="@container">
        <div className="grid @7xl:grid-cols-2 @7xl:gap-16 gap-10">
          <div className="flex min-w-0 flex-col gap-4">
            {head}

            <div className="flex flex-wrap items-end gap-4 border-border border-t border-b border-b-separator py-4">
              <NumberField
                className="w-60 max-md:w-full"
                formatOptions={SGD_FORMAT}
                maxValue={1_000_000}
                minValue={0}
                onBlur={() =>
                  posthog.capture("arf_calculator_used", {
                    field: "omv",
                    schedule: schedule.key,
                  })
                }
                onChange={(value) => setOmv(Number.isFinite(value) ? value : 0)}
                value={omv}
              >
                <Label>OMV</Label>
                <NumberField.Group>
                  <NumberField.Input />
                </NumberField.Group>
              </NumberField>
              <Select
                className="w-72 max-md:w-full"
                onChange={(key) => {
                  if (!key) return;
                  posthog.capture("arf_calculator_used", {
                    field: "schedule",
                    schedule: key,
                  });
                  setScheduleKey(String(key));
                }}
                value={scheduleKey}
              >
                <Label>COE obtained</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {ARF_SCHEDULES.map(({ key, label }) => (
                      <ListBox.Item id={key} key={key} textValue={label}>
                        {label}
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
              </Select>
            </div>

            <div className="flex max-w-xl flex-col gap-2.5">
              <span className="text-muted-strong text-sm">
                <span className="font-semibold text-foreground">
                  Estimated ARF payable
                </span>
                {` · COE obtained ${schedule.label}`}
              </span>
              <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
                <span
                  aria-live="polite"
                  className="font-extrabold text-4xl tabular-nums leading-none tracking-tight md:text-5xl"
                >
                  {formatCurrency(total)}
                </span>
                {omv > 0 ? (
                  <Chip
                    className="tabular-nums"
                    color="accent"
                    size="sm"
                    variant="soft"
                  >
                    {formatRate(total / omv)} of OMV
                  </Chip>
                ) : null}
              </div>
              {topBand ? (
                <Typography.Paragraph className="tabular-nums" color="muted">
                  {`${bands.length} of ${schedule.tiers.length} bands reached; the last dollar of OMV is taxed at ${formatRate(topBand.rate)}.`}
                </Typography.Paragraph>
              ) : null}
              <SourceNote className="tabular-nums">
                {formatCurrency(omv)} OMV · before VES and EEAI rebates or
                surcharges. Estimates only, not financial advice.
              </SourceNote>
            </div>
          </div>

          <aside aria-label="Key numbers" className="flex flex-col gap-3">
            <Typography.Paragraph
              className="uppercase"
              color="muted"
              size="xs"
              weight="semibold"
            >
              Key numbers
            </Typography.Paragraph>
            <dl className="grid @3xl:grid-cols-4 @7xl:grid-cols-2 grid-cols-2 gap-x-6 border-separator border-t">
              {keyNumbers.map(({ label, note, value }) => (
                <div
                  className="flex flex-col gap-0.5 border-separator border-b py-3"
                  key={label}
                >
                  <dt className="font-semibold text-muted text-xs">{label}</dt>
                  <dd className="font-semibold text-xl tabular-nums">
                    {value}
                  </dd>
                  <dd className="text-muted text-xs tabular-nums">{note}</dd>
                </div>
              ))}
            </dl>
            <nav aria-label="On this page">
              <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
                {JUMP_LINKS.map(({ href, label }) => (
                  <li key={href}>
                    <a
                      className="font-semibold text-accent-strong hover:text-accent-deep"
                      href={href}
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <SourceNote>
              Source: LTA. Calculated from the OMV and schedule entered.
            </SourceNote>
          </aside>
        </div>
      </div>

      <Hairline />
      <ArfSchedules omv={omv} scheduleKey={schedule.key} />
      <Hairline />
      <ArfBands bands={bands} schedule={schedule} total={total} />
    </>
  );
}
