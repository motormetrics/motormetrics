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
import { DeregistrationValue } from "@web/app/(main)/(dashboard)/cars/parf/components/deregistration-value";
import { ParfComparison } from "@web/app/(main)/(dashboard)/cars/parf/components/parf-comparison";
import {
  AGE_BRACKETS,
  calculateParf,
  NEW_CAP,
  OLD_CAP,
  SGD_FORMAT,
} from "@web/app/(main)/(dashboard)/cars/parf/components/parf-rates";
import { ParfSchedule } from "@web/app/(main)/(dashboard)/cars/parf/components/parf-schedule";
import { Hairline, SourceNote } from "@web/components/shared/overview";
import posthog from "posthog-js";
import { type ReactNode, useState } from "react";

/** The page's sections, for the jump links under the key numbers. */
const JUMP_LINKS = [
  { href: "#parf-compare", label: "Old and new schedules" },
  { href: "#parf-rates", label: "Rebate rates by vehicle age" },
  { href: "#parf-dereg", label: "Deregistration value" },
  { href: "#parf-notes", label: "What the figures assume" },
];

/** "−60.0%", with a true minus for a fall. */
const formatSignedPercent = (ratio: number): string =>
  `${ratio < 0 ? "−" : "+"}${Math.abs(ratio * 100).toFixed(1)}%`;

/**
 * Direction D's head for the calculator: the page's own eyebrow, title and
 * source line (`head`), the two fields the rebate needs, and the answer under
 * them, with the key numbers beside the head once the page is wide and under
 * it before then. The figures beneath read the same state, so they live here
 * too; everything is client-rendered from fixed rates and lands in the static
 * shell with the defaults.
 */
export function PARFCalculator({ head }: { head: ReactNode }) {
  const [arf, setArf] = useState(80_000);
  const [bracketKey, setBracketKey] = useState("0");

  const bracket = AGE_BRACKETS[Number(bracketKey)] ?? AGE_BRACKETS[0];
  const result = calculateParf(arf, bracket);

  const selectBracket = (key: string) => {
    posthog.capture("parf_calculator_used", {
      bracket: AGE_BRACKETS[Number(key)]?.label,
      field: "bracket",
    });
    setBracketKey(key);
  };

  const keyNumbers = [
    {
      label: "Before Budget 2026",
      value: formatCurrency(result.oldRebate),
      // The $60,000 cap only covers COEs from February 2023, so an older COE
      // would get the uncapped figure.
      note: result.oldCapped
        ? `capped at ${formatCurrency(OLD_CAP)} · ${formatCurrency(result.oldUncapped)} for COEs before Feb 2023`
        : `${(bracket.oldRate * 100).toFixed(0)}% of ARF`,
    },
    {
      label: "Shortfall",
      value: formatCurrency(result.shortfall),
      note: "less in your hand",
    },
    {
      label: "New rate",
      value: `${(bracket.newRate * 100).toFixed(0)}%`,
      note: result.newCapped
        ? `capped at ${formatCurrency(NEW_CAP)}`
        : "of the ARF paid",
    },
    {
      label: "Rebate cap",
      value: formatCurrency(NEW_CAP),
      note: `was ${formatCurrency(OLD_CAP)}`,
    },
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
                  posthog.capture("parf_calculator_used", {
                    bracket: bracket.label,
                    field: "arf",
                  })
                }
                onChange={(value) => setArf(Number.isFinite(value) ? value : 0)}
                value={arf}
              >
                <Label>ARF paid</Label>
                <NumberField.Group>
                  <NumberField.Input />
                </NumberField.Group>
              </NumberField>
              <Select
                className="w-72 max-md:w-full"
                onChange={(key) => {
                  if (key) selectBracket(String(key));
                }}
                value={bracketKey}
              >
                <Label>Age at deregistration</Label>
                <Select.Trigger>
                  <Select.Value />
                  <Select.Indicator />
                </Select.Trigger>
                <Select.Popover>
                  <ListBox>
                    {AGE_BRACKETS.map(({ key, label }) => (
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
                  Estimated rebate after Budget 2026
                </span>
                {` · ${bracket.label}`}
              </span>
              <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
                <span
                  aria-live="polite"
                  className="font-extrabold text-4xl tabular-nums leading-none tracking-tight md:text-5xl"
                >
                  {formatCurrency(result.newRebate)}
                </span>
                {result.oldRebate > 0 ? (
                  <Chip
                    className="tabular-nums"
                    color="accent"
                    size="sm"
                    variant="soft"
                  >
                    {formatSignedPercent(
                      (result.newRebate - result.oldRebate) / result.oldRebate,
                    )}{" "}
                    · −{formatCurrency(result.shortfall)}
                  </Chip>
                ) : null}
              </div>
              <Typography.Paragraph className="tabular-nums" color="muted">
                {bracket.oldRate === 0
                  ? "No PARF rebate is given for vehicles over 10 years old, under either schedule."
                  : `${formatCurrency(result.shortfall)} less than the ${formatCurrency(result.oldRebate)} under the old schedule.`}
              </Typography.Paragraph>
              <SourceNote className="tabular-nums">
                {formatCurrency(arf)} ARF · {bracket.label} · rebate capped at{" "}
                {formatCurrency(NEW_CAP)}. Estimates only, not financial advice.
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
              Source: LTA. Calculated from the ARF and age entered.
            </SourceNote>
          </aside>
        </div>
      </div>

      <Hairline />
      <ParfComparison arf={arf} bracket={bracket} result={result} />
      <Hairline />
      <ParfSchedule
        arf={arf}
        bracketKey={bracketKey}
        onSelect={selectBracket}
      />
      <Hairline />
      <DeregistrationValue bracketLabel={bracket.label} result={result} />
    </>
  );
}
