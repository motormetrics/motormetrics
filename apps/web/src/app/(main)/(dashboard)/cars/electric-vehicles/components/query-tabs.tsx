"use client";

import { cn } from "@heroui/react";
import { parseAsString, useQueryState } from "nuqs";
import posthog from "posthog-js";

interface QueryTabsProps<Value extends string> {
  /** Accessible name for the group, since the tabs carry no visible label. */
  ariaLabel: string;
  options: { key: Value; label: string }[];
  /** Search-param key the tabs write to. */
  param: string;
  /** Currently selected key, as resolved on the server. */
  value: Value;
  /** `pill` for the v3 tab rows, `segmented` for the charging controls. */
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
        "flex min-w-0 flex-wrap gap-2",
        variant === "segmented" && "gap-1.5 rounded-full bg-default p-1.5",
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
                ? "px-4 py-2 font-semibold text-sm"
                : "px-[18px] py-2.5 font-semibold text-sm",
              isActive &&
                variant === "segmented" &&
                "bg-surface shadow-surface",
              isActive &&
                variant === "pill" &&
                "bg-accent text-accent-foreground",
              !isActive && variant === "segmented" && "text-muted",
              !isActive &&
                variant === "pill" &&
                "bg-default text-foreground/75 hover:brightness-[1.03]",
              isActive && "font-extrabold",
            )}
            key={option.key}
            onClick={() => {
              posthog.capture("dashboard_filter_changed", {
                filter: param,
                value: option.key,
              });
              setValue(option.key);
            }}
            type="button"
          >
            {option.label}
          </button>
        );
      })}
    </fieldset>
  );
}
