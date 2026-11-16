"use client";

import { Tabs } from "@heroui/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import type { ComponentProps, MouseEvent } from "react";

export interface FilterTab {
  id: string;
  label: string;
  /** Built on the server with the page's nuqs serializer. */
  href: string;
  /**
   * Where a click goes in the browser, when that differs from `href`: state
   * the page keeps for the reader but leaves out of the link in the HTML, so
   * it is not a URL for a crawler to follow.
   */
  navigateTo?: string;
}

/**
 * A tab whose click goes to `navigateTo` while its `href` stays as rendered.
 * A modified click (new tab, new window) follows the `href`.
 */
function BrowserDestinationLink({
  navigateTo,
  onClick,
  ...props
}: ComponentProps<typeof Link> & { navigateTo: string }) {
  const router = useRouter();

  return (
    <Link
      {...props}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        if (
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        ) {
          return;
        }
        event.preventDefault();
        router.push(navigateTo, { scroll: false });
      }}
    />
  );
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
          {tabs.map(({ href, id, label, navigateTo }) => (
            <Tabs.Tab
              className="whitespace-nowrap"
              href={href}
              id={id}
              key={id}
              render={(domProps) => {
                // Every tab here has an href, so React Aria always passes
                // anchor props; the render type only allows for a div too.
                // scroll={false} keeps the reader where the filter is.
                const anchorProps = domProps as ComponentProps<"a">;

                return navigateTo ? (
                  <BrowserDestinationLink
                    {...anchorProps}
                    href={href}
                    navigateTo={navigateTo}
                    scroll={false}
                  />
                ) : (
                  <Link {...anchorProps} href={href} scroll={false} />
                );
              }}
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
