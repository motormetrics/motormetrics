"use client";

import { Tabs } from "@heroui/react";

import Typography from "@web/components/typography";
import type { TypeItem } from "@web/types";
import type { FuelType } from "@web/types/cars";
import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";
import { useMemo } from "react";
import { CategoryHeroCard } from "./category-hero-card";
import { TopMakesChart } from "./top-makes-chart";

interface CategoryTabsPanelProps {
  types: TypeItem[];
  month: string;
  title: string;
  totalRegistrations: number;
  topMakesByFuelType?: FuelType[];
}

export function CategoryTabsPanel({
  types,
  month,
  title,
  totalRegistrations,
  topMakesByFuelType = [],
}: CategoryTabsPanelProps) {
  const makesByFuelType = useMemo(
    () =>
      new Map(
        topMakesByFuelType.map((fuelType) => [fuelType.fuelType, fuelType]),
      ),
    [topMakesByFuelType],
  );

  const rankMap = useMemo(() => {
    const sortedTypes = [...types].sort((a, b) => b.count - a.count);
    return new Map(sortedTypes.map((type, index) => [type.name, index + 1]));
  }, [types]);

  return (
    <section className="rounded-2xl border border-border bg-surface p-4 shadow-surface md:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Typography.H4>{title} Breakdown</Typography.H4>
          <Typography.TextSm>
            Select a {title.toLowerCase()} to inspect its registration share and
            make mix.
          </Typography.TextSm>
        </div>

        <Tabs className="w-full" variant="secondary">
          <Tabs.ListContainer>
            <Tabs.List aria-label={`${title} Statistics`}>
              {types.map((type) => (
                <Tabs.Tab key={type.name} id={type.name}>
                  {formatVehicleType(type.name)}
                  <Tabs.Indicator />
                </Tabs.Tab>
              ))}
            </Tabs.List>
          </Tabs.ListContainer>

          {types.map((type) => {
            const fuelTypeData = makesByFuelType.get(type.name);
            const rank = rankMap.get(type.name) ?? types.length;

            return (
              <Tabs.Panel key={type.name} id={type.name}>
                <div className="flex flex-col gap-5 py-4">
                  <CategoryHeroCard
                    categoryTitle={title}
                    count={type.count}
                    totalRegistrations={totalRegistrations}
                    month={month}
                    rank={rank}
                    totalCategories={types.length}
                  />

                  {fuelTypeData && fuelTypeData.makes.length > 0 ? (
                    <TopMakesChart
                      makes={fuelTypeData.makes}
                      total={fuelTypeData.total}
                      title={formatVehicleType(type.name)}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border border-dashed bg-surface-secondary p-8 text-center">
                      <Typography.H4>Top Makes Unavailable</Typography.H4>
                      <Typography.TextSm>
                        Make-level data is not available for{" "}
                        {formatVehicleType(type.name)} in this view.
                      </Typography.TextSm>
                    </div>
                  )}
                </div>
              </Tabs.Panel>
            );
          })}
        </Tabs>
      </div>
    </section>
  );
}
