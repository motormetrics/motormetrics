import { carPopulation } from "@motormetrics/database";
import type { CarPopulation } from "@motormetrics/types";
import { update } from "@web/lib/updater";

const CAR_POPULATION_URL =
  "https://datamall.lta.gov.sg/content/dam/datamall/datasets/Facts_Figures/Vehicle Population/Annual Car Population by Make.zip";

export const updateCarPopulation = () =>
  update<CarPopulation>({
    table: carPopulation,
    url: CAR_POPULATION_URL,
    csvTransformOptions: {
      columnMapping: {
        fuel_type: "fuelType",
      },
      fields: {
        number: (value: string) => (value === "" ? 0 : Number(value)),
      },
    },
  });
