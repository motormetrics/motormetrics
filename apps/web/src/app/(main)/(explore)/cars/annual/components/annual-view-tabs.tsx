"use client";

import { Tab, Tabs } from "@heroui/tabs";
import {
  VIEWS,
  type View,
} from "@web/app/(main)/(explore)/cars/annual/search-params";
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
      variant="underlined"
      aria-label="Annual data view"
    >
      <Tab key="fuel-type" title="By Fuel Type">
        <div className="flex flex-col gap-10 pt-4">{fuelTypeContent}</div>
      </Tab>
      <Tab key="make" title="By Make">
        <div className="flex flex-col gap-10 pt-4">{makeContent}</div>
      </Tab>
    </Tabs>
  );
}
