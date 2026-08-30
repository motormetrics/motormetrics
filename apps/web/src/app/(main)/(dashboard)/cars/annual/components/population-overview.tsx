"use client";

import { ElectricFleetPanel } from "@web/app/(main)/(dashboard)/cars/annual/components/electric-fleet-panel";
import { FuelChangeRail } from "@web/app/(main)/(dashboard)/cars/annual/components/fuel-change-rail";
import { PopulationByYearChart } from "@web/app/(main)/(dashboard)/cars/annual/components/population-by-year-chart";
import { PopulationFuelMix } from "@web/app/(main)/(dashboard)/cars/annual/components/population-fuel-mix";
import { PopulationHero } from "@web/app/(main)/(dashboard)/cars/annual/components/population-hero";
import { PopulationTable } from "@web/app/(main)/(dashboard)/cars/annual/components/population-table";
import type {
  DimensionLabels,
  PopulationSeries,
} from "@web/app/(main)/(dashboard)/cars/annual/population-series";
import { AnimatedGrid } from "@web/app/(main)/(dashboard)/components/animated-grid";
import { AnimatedSection } from "@web/app/(main)/(dashboard)/components/animated-section";
import { Bento, RAIL_CLASS } from "@web/components/shared/bento";
import { parseAsString, useQueryState } from "nuqs";

/**
 * The bento itself. The server hands over every entity's series in one payload,
 * so focusing a row is a client-side re-render rather than another round trip —
 * which is why the focused row lives in the URL shallowly: shareable, but not
 * a refetch.
 */
export function PopulationOverview({
  data,
  labels,
}: {
  data: PopulationSeries;
  labels: DimensionLabels;
}) {
  const [focus, setFocus] = useQueryState("focus", parseAsString);

  const entity =
    data.entities.find((candidate) => candidate.name === focus) ?? data.overall;
  const hasFuelSplit = entity.fuel.length > 0;

  return (
    <Bento>
      {/* Left column — the focused population and how it is fuelled */}
      <AnimatedGrid className="flex flex-col gap-6">
        <AnimatedSection>
          <PopulationHero
            entity={entity}
            noun={labels.noun}
            previousYear={data.previousYear}
            year={data.year}
            years={data.years}
          />
        </AnimatedSection>
        <AnimatedSection>
          <PopulationFuelMix entity={entity} year={data.year} />
        </AnimatedSection>
      </AnimatedGrid>

      {/* Middle column — the run of years, then every entity side by side */}
      <AnimatedGrid className="flex flex-col gap-6">
        <AnimatedSection>
          <PopulationByYearChart entity={entity} years={data.years} />
        </AnimatedSection>
        <AnimatedSection>
          <PopulationTable
            entities={data.entities}
            focus={focus}
            labels={labels}
            onSelect={(name) => setFocus(name)}
            previousYear={data.previousYear}
            year={data.year}
          />
        </AnimatedSection>
      </AnimatedGrid>

      {/* Right rail — warm sand well: fuel movement over the electric panel */}
      {hasFuelSplit ? (
        <AnimatedGrid className={RAIL_CLASS}>
          <AnimatedSection>
            <FuelChangeRail entity={entity} previousYear={data.previousYear} />
          </AnimatedSection>
          <AnimatedSection>
            <ElectricFleetPanel
              entity={entity}
              noun={labels.noun}
              years={data.years}
            />
          </AnimatedSection>
        </AnimatedGrid>
      ) : null}
    </Bento>
  );
}
