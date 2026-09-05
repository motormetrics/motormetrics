"use client";

import { cn, ToggleButton, ToggleButtonGroup } from "@heroui/react";
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
    <ToggleButtonGroup
      aria-label={ariaLabel}
      className={cn(
        "flex min-w-0 flex-wrap gap-2",
        variant === "segmented" && "gap-1.5 rounded-full bg-default p-1.5",
      )}
      disallowEmptySelection
      isDetached
      onSelectionChange={(keys) => {
        const [key] = [...keys];
        if (key === undefined) {
          return;
        }
        posthog.capture("dashboard_filter_changed", {
          filter: param,
          value: key,
        });
        setValue(String(key));
      }}
      selectedKeys={[value]}
      selectionMode="single"
    >
      {options.map((option) => (
        <ToggleButton
          className={cn(
            "h-auto whitespace-nowrap rounded-full bg-transparent font-semibold text-sm transition-colors data-[selected=true]:font-extrabold",
            variant === "segmented"
              ? "px-4 py-2 text-muted hover:bg-transparent data-[selected=true]:bg-surface data-[selected=true]:text-foreground data-[selected=true]:shadow-surface"
              : "bg-default px-[18px] py-2.5 text-foreground/75 hover:bg-default hover:brightness-[1.03] data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
          )}
          id={option.key}
          key={option.key}
        >
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
