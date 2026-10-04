"use client";

import { Button, Dropdown, Label } from "@heroui/react";
import {
  isRange,
  RANGE_LABELS,
  RANGES,
} from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { ChevronDown } from "lucide-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useTransition } from "react";

/**
 * The period picker in the page eyebrow — the makes-page counterpart of
 * `shared/month-menu.tsx`: the selected range as a ghost button with a
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
        isPending={isPending}
        variant="ghost"
      >
        {RANGE_LABELS[range]}
        <ChevronDown aria-hidden className="size-4" strokeWidth={2.25} />
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu
          onAction={(key) => {
            const next = String(key);
            if (!isRange(next)) {
              return;
            }
            posthog.capture("dashboard_filter_changed", {
              filter: "range",
              value: next,
            });
            setRange(next);
          }}
          selectedKeys={[range]}
          selectionMode="single"
        >
          {RANGES.map((option) => (
            <Dropdown.Item
              id={option}
              key={option}
              textValue={RANGE_LABELS[option]}
            >
              <Dropdown.ItemIndicator />
              <Label>{RANGE_LABELS[option]}</Label>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
