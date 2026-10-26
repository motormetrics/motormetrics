"use client";

import { Button, Dropdown, Label } from "@heroui/react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { useTransition } from "react";

/**
 * The one control on the page: a menu of the curated pairs, the current one
 * selected. One menu rather than two free make pickers and a swap button,
 * because only the curated pairs exist — any other combination, or the
 * reversed order, would 404.
 */
export function PairMenu({
  current,
  pairs,
}: {
  /** The current pair's slug. */
  current: string;
  pairs: { label: string; slug: string }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const currentLabel =
    pairs.find(({ slug }) => slug === current)?.label ?? "Compare";

  return (
    <Dropdown>
      <Button
        aria-label={`Comparison: ${currentLabel}`}
        className="md:h-11"
        isPending={isPending}
        size="lg"
        variant="ghost"
      >
        {currentLabel}
        <ChevronDown aria-hidden className="size-4" strokeWidth={2.25} />
      </Button>
      <Dropdown.Popover>
        <Dropdown.Menu
          onAction={(key) => {
            const slug = String(key);
            if (slug === current) {
              return;
            }
            posthog.capture("dashboard_filter_changed", {
              filter: "compare_pair",
              value: slug,
            });
            startTransition(() => {
              router.push(`/cars/makes/compare/${slug}`);
            });
          }}
          selectedKeys={[current]}
          selectionMode="single"
        >
          {pairs.map(({ label, slug }) => (
            <Dropdown.Item
              className="min-h-11"
              id={slug}
              key={slug}
              textValue={label}
            >
              <Dropdown.ItemIndicator />
              <Label>{label}</Label>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
