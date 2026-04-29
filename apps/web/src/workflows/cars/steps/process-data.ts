import { cars } from "@motormetrics/database";
import type { Car } from "@motormetrics/types";
import { cleanSpecialChars } from "@motormetrics/utils";
import { LTA_DATAMALL_BASE_URL } from "@web/config/workflow";
import { update } from "@web/lib/updater";

export const updateCars = () => {
  const filename = "Monthly New Registration of Cars by Make.zip";
  const url = `${LTA_DATAMALL_BASE_URL}/${filename}`;

  return update<Car>({
    table: cars,
    url,
    csvTransformOptions: {
      columnMapping: {
        fuel_type: "fuelType",
        vehicle_type: "vehicleType",
        importer_type: "importerType",
      },
      fields: {
        make: (value: string) =>
          cleanSpecialChars(value, { separator: "." }).toUpperCase(),
        vehicleType: (value: string) =>
          cleanSpecialChars(value, { separator: "/", joinSeparator: "/" }),
        number: (value: string | number) => (value === "" ? 0 : Number(value)),
      },
    },
  });
};
