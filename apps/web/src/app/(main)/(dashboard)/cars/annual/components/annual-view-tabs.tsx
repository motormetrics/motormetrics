"use client";

import { Tabs } from "@heroui/react";

import {
  VIEWS,
  type View,
} from "@web/app/(main)/(dashboard)/cars/annual/search-params";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { type ReactNode, useTransition } from "react";

interface AnnualViewTabsProps {
  fuelTypeContent: ReactNode;
  makeContent: ReactNode;
}

export function AnnualViewTabs({
  fuelTypeContent,
  makeContent,
}: AnnualViewTabsProps) {
  const [, startTransition] = useTransition();
  const [view, setView] = useQueryState(
    "view",
    parseAsStringLiteral(VIEWS)
      .withDefault("fuel-type")
      .withOptions({ shallow: false, startTransition }),
  );

  return (
    <Tabs
      selectedKey={view}
      onSelectionChange={(key) => {
        posthog.capture("annual_view_tab_changed", { view: key as string });
        setView(key as View);
      }}
      variant="secondary"
      aria-label="Annual data view"
    >
      <Tabs.ListContainer>
        <Tabs.List aria-label="Annual data view">
          <Tabs.Tab id="fuel-type">
            By Fuel Type
            <Tabs.Indicator />
          </Tabs.Tab>
          <Tabs.Tab id="make">
            By Make
            <Tabs.Indicator />
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.ListContainer>
      <Tabs.Panel id="fuel-type">
        <div className="flex flex-col gap-10 pt-4">{fuelTypeContent}</div>
      </Tabs.Panel>
      <Tabs.Panel id="make">
        <div className="flex flex-col gap-10 pt-4">{makeContent}</div>
      </Tabs.Panel>
    </Tabs>
  );
}
