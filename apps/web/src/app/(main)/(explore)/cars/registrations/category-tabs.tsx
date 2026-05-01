"use client";

import { Tabs } from "@heroui/react";

import { StatCard } from "@web/components/shared/stat-card";
import type { Registration } from "@web/types/cars";

interface CategoryTabsProps {
  cars: Registration;
}

export const CategoryTabs = ({ cars }: CategoryTabsProps) => {
  return (
    <Tabs variant="secondary">
      <Tabs.ListContainer>
        <Tabs.List aria-label="Registration categories">
          <Tabs.Tab id="fuelType">
            By Fuel Type
            <Tabs.Indicator />
          </Tabs.Tab>
          <Tabs.Tab id="vehicleType">
            By Vehicle Type
            <Tabs.Indicator />
          </Tabs.Tab>
        </Tabs.List>
      </Tabs.ListContainer>
      <Tabs.Panel id="fuelType">
        <StatCard
          title="By Fuel Type"
          description="Distribution of vehicles based on fuel type"
          data={cars.fuelType}
          total={cars.total}
        />
      </Tabs.Panel>
      <Tabs.Panel id="vehicleType">
        <StatCard
          title="By Vehicle Type"
          description="Distribution of vehicles based on vehicle type"
          data={cars.vehicleType}
          total={cars.total}
        />
      </Tabs.Panel>
    </Tabs>
  );
};
