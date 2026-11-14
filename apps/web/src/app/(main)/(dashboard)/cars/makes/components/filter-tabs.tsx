"use client";

import { Tabs } from "@heroui/react";
import Link from "next/link";
import posthog from "posthog-js";
import type { ComponentProps } from "react";

export interface FilterTab {
  id: string;
  label: string;
  /** Built on the server with the page's nuqs serializer. */
  href: string;
}

/**
 * A filter switch whose options are plain links. The server builds every
 * href, so each filtered view is a crawlable URL and switching is an ordinary
 * navigation that re-renders the page against the new search params.
 *
 * The selection moves as soon as a tab is pressed rather than waiting for the
 * new page; `key` resets it whenever the server sends a different selection.
 */
export function FilterTabs({
  "aria-label": ariaLabel,
  filter,
  selectedKey,
  tabs,
}: {
  "aria-label": string;
  /** Names the filter in the analytics event. */
  filter: string;
  selectedKey: string;
  tabs: readonly FilterTab[];
}) {
  return (
    <Tabs
      defaultSelectedKey={selectedKey}
      key={selectedKey}
      onSelectionChange={(key) =>
        posthog.capture("dashboard_filter_changed", {
          filter,
          value: String(key),
        })
      }
    >
      <Tabs.ListContainer>
        <Tabs.List aria-label={ariaLabel}>
          {tabs.map(({ href, id, label }) => (
            <Tabs.Tab
              className="whitespace-nowrap"
              href={href}
              id={id}
              key={id}
              render={(domProps) => (
                // Every tab here has an href, so React Aria always passes
                // anchor props; the render type only allows for a div too.
                // scroll={false} keeps the reader where the filter is.
                <Link
                  {...(domProps as ComponentProps<"a">)}
                  href={href}
                  scroll={false}
                />
              )}
            >
              {label}
              <Tabs.Indicator />
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs.ListContainer>
    </Tabs>
  );
}
