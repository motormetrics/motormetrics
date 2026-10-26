"use client";

import { Button, Label, ListBox, Select } from "@heroui/react";
import type { MakeOption } from "@web/app/(main)/(dashboard)/cars/makes/compare/components/selection";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import { type FormEvent, useTransition } from "react";

const SELECTORS = ["First make", "Second make"] as const;

/**
 * Two make selectors in a plain GET form. Each `Select` renders a hidden
 * native select named `make`, so without JavaScript the browser submits
 * `?make=a&make=b` on its own; with it, the submit becomes a client
 * navigation to the same URL.
 */
export function MakePicker({
  makes,
  selected,
}: {
  makes: MakeOption[];
  /** The preselected make slugs, in column order. */
  selected: readonly string[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = new URLSearchParams();
    for (const value of new FormData(event.currentTarget).getAll("make")) {
      query.append("make", String(value));
    }
    posthog.capture("dashboard_filter_changed", {
      filter: "compare_makes",
      value: query.getAll("make").join(","),
    });
    startTransition(() => {
      router.push(`/cars/makes/compare?${query}`);
    });
  };

  return (
    <form
      action="/cars/makes/compare"
      className="flex flex-wrap items-end gap-3"
      method="get"
      onSubmit={handleSubmit}
    >
      {SELECTORS.map((label, index) => (
        <Select
          className="w-full sm:w-56"
          defaultValue={selected[index] ?? null}
          key={label}
          name="make"
          placeholder="Choose a make"
        >
          <Label>{label}</Label>
          <Select.Trigger className="min-h-11">
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover className="max-h-96">
            <ListBox>
              {makes.map(({ name, slug }) => (
                <ListBox.Item id={slug} key={slug} textValue={name}>
                  {name}
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>
      ))}
      <Button
        // `.button--lg` drops to h-10 from md; keep the 44px target and match
        // the select triggers beside it.
        className="md:h-11"
        isPending={isPending}
        size="lg"
        type="submit"
      >
        Compare
      </Button>
    </form>
  );
}
