"use client";

import { cn } from "@heroui/react";
import { Segment } from "@heroui-pro/react";
import { parseAsString, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useTransition } from "react";

interface QueryTabsProps<Value extends string> {
  /** Accessible name for the group, since the tabs carry no visible label. */
  ariaLabel: string;
  options: { key: Value; label: string }[];
  /** Search-param key the tabs write to. */
  param: string;
  /** Currently selected key, as resolved on the server. */
  value: Value;
  /**
   * `pill` renders Segment's ghost variant for the tab rows; `segmented` its
   * default variant for the charging controls.
   */
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
  const [isPending, startTransition] = useTransition();
  const [, setValue] = useQueryState(
    param,
    parseAsString
      .withDefault(value)
      .withOptions({ shallow: false, startTransition }),
  );
  const isPill = variant === "pill";

  return (
    // Segment is a non-wrapping inline-flex, so a row wider than a phone (the
    // four powertrain tabs) scrolls sideways inside this wrapper instead.
    <div className="max-w-full overflow-x-auto">
      <Segment
        aria-label={ariaLabel}
        className={cn(isPill && "max-md:w-full", isPending && "opacity-70")}
        onSelectionChange={(key) => {
          posthog.capture("dashboard_filter_changed", {
            filter: param,
            value: key,
          });
          setValue(String(key));
        }}
        selectedKey={value}
        size={isPill ? "sm" : "md"}
        variant={isPill ? "ghost" : "default"}
      >
        {options.map((option) => (
          <Segment.Item
            className={cn(isPill && "max-md:flex-1 max-md:px-2")}
            id={option.key}
            key={option.key}
          >
            {option.label}
          </Segment.Item>
        ))}
      </Segment>
    </div>
  );
}
