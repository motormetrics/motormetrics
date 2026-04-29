import { vehiclePopulation } from "@motormetrics/database";
import type { VehiclePopulation } from "@motormetrics/types";
import { update } from "@web/lib/updater";

const VEHICLE_POPULATION_URL =
  "https://datamall.lta.gov.sg/content/dam/datamall/datasets/Facts_Figures/Vehicle Population/Annual Motor Vehicle Population by Type of Fuel Used.zip";

export const updateVehiclePopulation = () =>
  update<VehiclePopulation>({
    table: vehiclePopulation,
    url: VEHICLE_POPULATION_URL,
    csvTransformOptions: {
      columnMapping: {
        type: "category",
        engine: "fuelType",
      },
      fields: {
        number: (value: string) => (value === "" ? 0 : Number(value)),
      },
    },
  });
