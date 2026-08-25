"use client";

import { cn } from "@heroui/react";
import { parseAsString, useQueryState } from "nuqs";

interface QueryTabsProps<Value extends string> {
  /** Accessible name for the group, since the tabs carry no visible label. */
  ariaLabel: string;
  options: { key: Value; label: string }[];
  /** Search-param key the tabs write to. */
  param: string;
  /** Currently selected key, as resolved on the server. */
  value: Value;
  /** `pill` for the powertrain row, `segmented` for the range control. */
  variant?: "pill" | "segmented";
}

/**
 * Tab row that writes its selection to the URL.
 *
 * `shallow: false` is what keeps the page a server component: the click is a
 * navigation, so the blocks re-render server-side with the new selection rather
 * than shipping the whole series to the browser. The active tab is read from
 * the `value` prop — resolved server-side — rather than from the hook, so the
 * first paint cannot disagree with what the server rendered.
 */
export function QueryTabs<Value extends string>({
  ariaLabel,
  options,
  param,
  value,
  variant = "pill",
}: QueryTabsProps<Value>) {
  const [, setValue] = useQueryState(
    param,
    parseAsString.withDefault(value).withOptions({ shallow: false }),
  );

  return (
    <fieldset
      className={cn(
        "flex min-w-0 flex-wrap gap-1.5",
        variant === "segmented" && "rounded-full bg-default p-1.5",
      )}
    >
      <legend className="sr-only">{ariaLabel}</legend>
      {options.map((option) => {
        const isActive = option.key === value;

        return (
          <button
            aria-pressed={isActive}
            className={cn(
              "cursor-pointer whitespace-nowrap rounded-full transition-colors",
              variant === "segmented"
                ? "px-4 py-2 font-semibold text-[13.5px]"
                : "px-[18px] py-2.5 font-semibold text-sm",
              isActive &&
                variant === "segmented" &&
                "bg-surface shadow-surface",
              isActive &&
                variant === "pill" &&
                "bg-accent text-accent-foreground",
              !isActive &&
                variant === "segmented" &&
                "text-[var(--muted-strong)]",
              !isActive &&
                variant === "pill" &&
                "bg-background text-foreground/75",
              isActive && "font-extrabold",
            )}
            key={option.key}
            onClick={() => setValue(option.key)}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </fieldset>
  );
}
