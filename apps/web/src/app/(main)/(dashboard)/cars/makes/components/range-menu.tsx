"use client";

import { Button, Dropdown, Label } from "@heroui/react";
import { ChevronDown } from "lucide-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useTransition } from "react";
import { RANGE_LABELS, RANGES } from "../search-params";

/**
 * The period picker in the page eyebrow — the makes-page counterpart of
 * `shared/month-menu.tsx`: the selected range as a bold accent label with a
 * chevron, opening a menu of the three periods.
 *
 * Writes the `range` search param with `shallow: false` so every section
 * re-renders on the server against the new period; no registration data
 * crosses into the client bundle.
 */
export function RangeMenu() {
  const [isPending, startTransition] = useTransition();
  const [range, setRange] = useQueryState(
    "range",
    parseAsStringLiteral(RANGES)
      .withDefault("ytd")
      .withOptions({ shallow: false, startTransition }),
  );

  return (
    <Dropdown>
      <Button
        aria-label="Registration period"
        className={
          "h-auto gap-2 rounded-full bg-transparent p-0 font-bold text-accent-strong text-base transition-colors hover:bg-transparent hover:text-accent-deep data-[pressed]:bg-transparent"
        }
        isPending={isPending}
        variant="tertiary"
      >
        {RANGE_LABELS[range]}
        <ChevronDown aria-hidden className="size-4" strokeWidth={2.25} />
      </Button>
      <Dropdown.Popover className="min-w-52">
        <Dropdown.Menu
          onAction={(key) => {
            const next = String(key);
            if (!RANGES.includes(next as (typeof RANGES)[number])) {
              return;
            }
            posthog.capture("dashboard_filter_changed", {
              filter: "range",
              value: next,
            });
            setRange(next as (typeof RANGES)[number]);
          }}
        >
          {RANGES.map((option) => {
            const isActive = option === range;

            return (
              <Dropdown.Item
                className={
                  isActive
                    ? "bg-accent-soft-2 font-bold text-accent-deep"
                    : undefined
                }
                id={option}
                key={option}
                textValue={RANGE_LABELS[option]}
              >
                <Label>{RANGE_LABELS[option]}</Label>
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
