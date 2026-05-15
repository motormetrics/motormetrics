"use client";

import type { CarLogo } from "@logos/types";
import { slugify } from "@motormetrics/utils";
import { AllMakes } from "@web/app/[locale]/(main)/(dashboard)/cars/components/makes/all-makes";
import { MakeSearch } from "@web/app/[locale]/(main)/(dashboard)/cars/components/makes/make-search";
import { MakesSummary } from "@web/app/[locale]/(main)/(dashboard)/cars/components/makes/makes-summary";
import { PopularMakes } from "@web/app/[locale]/(main)/(dashboard)/cars/components/makes/popular-makes";
import type {
  Make,
  MakeStats,
  MakesSummary as MakesSummaryType,
} from "@web/types";
import { useMemo } from "react";

interface MakesDashboardProps {
  sortedMakes: Make[];
  groupedMakes: Record<string, Make[]>;
  letters: string[];
  popularMakes: Make[];
  logos?: CarLogo[] | null;
  makeStatsMap?: Record<string, MakeStats>;
  makesSummary?: MakesSummaryType;
}

export function MakesDashboard({
  sortedMakes,
  groupedMakes,
  letters,
  popularMakes,
  logos = [],
  makeStatsMap,
  makesSummary,
}: MakesDashboardProps) {
  const logoUrlMap = useMemo(() => {
    return (
      logos?.reduce<Record<string, string>>((acc, logo) => {
        if (logo.url) {
          acc[slugify(logo.make)] = logo.url;
        }
        return acc;
      }, {}) ?? {}
    );
  }, [logos]);

  return (
    <div className="flex flex-col gap-4">
      {makesSummary && <MakesSummary summary={makesSummary} />}
      <MakeSearch makes={sortedMakes} />
      <PopularMakes
        makes={popularMakes}
        logoUrlMap={logoUrlMap}
        makeStatsMap={makeStatsMap}
      />
      <AllMakes
        title="All Makes"
        sortedMakes={sortedMakes}
        groupedMakes={groupedMakes}
        letters={letters}
        logoUrlMap={logoUrlMap}
      />
    </div>
  );
}
