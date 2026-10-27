"use client";

import { Tabs } from "@heroui/react";
import type { ReactNode } from "react";

export interface TrendTab {
  id: string;
  label: string;
  /** The panel, rendered on the server and passed through as-is. */
  content: ReactNode;
}

/**
 * The tab row and panels of the homepage trend panel. A file of its own
 * because HeroUI's Tabs is a client component; the charts arrive already
 * rendered, so only the selection lives in the browser.
 */
export function MarketTrendTabs({
  heading,
  tabs,
}: {
  heading: ReactNode;
  tabs: TrendTab[];
}) {
  return (
    <Tabs className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {heading}
        <Tabs.ListContainer className="max-w-full">
          <Tabs.List aria-label="Series">
            {tabs.map((tab) => (
              <Tabs.Tab className="whitespace-nowrap" id={tab.id} key={tab.id}>
                {tab.label}
                <Tabs.Indicator />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>
      </div>
      {tabs.map((tab) => (
        <Tabs.Panel id={tab.id} key={tab.id}>
          {tab.content}
        </Tabs.Panel>
      ))}
    </Tabs>
  );
}
