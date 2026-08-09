import { db } from "@motormetrics/database";
import { cacheLife, cacheTag } from "next/cache";

function normalisePattern(input: string) {
  return input.replaceAll("-", "%");
}

interface EntityCheckConfig {
  // RQB v2 keys `where`/`columns` by field name, so the column object the v1
  // builder needed is no longer required here.
  fieldName: "make" | "fuelType" | "vehicleType";
  normalise: boolean;
}

const MAKE_CHECK: EntityCheckConfig = {
  fieldName: "make",
  normalise: false,
};

const FUEL_TYPE_CHECK: EntityCheckConfig = {
  fieldName: "fuelType",
  normalise: true,
};

const VEHICLE_TYPE_CHECK: EntityCheckConfig = {
  fieldName: "vehicleType",
  normalise: true,
};

function findEntity(config: EntityCheckConfig, value: string) {
  const pattern = config.normalise ? normalisePattern(value) : value;
  return db.query.cars.findFirst({
    where: { [config.fieldName]: { ilike: pattern } },
    columns: { [config.fieldName]: true },
  });
}

export async function checkMakeIfExist(
  make: string,
): Promise<{ make: string } | undefined> {
  "use cache";
  cacheLife("max");
  cacheTag(`cars:make:${make}`);

  const result = await findEntity(MAKE_CHECK, make);
  return result as { make: string } | undefined;
}

export async function checkFuelTypeIfExist(
  fuelType: string,
): Promise<{ fuelType: string } | undefined> {
  "use cache";
  cacheLife("max");
  cacheTag(`cars:fuel:${fuelType}`);

  const result = await findEntity(FUEL_TYPE_CHECK, fuelType);
  return result as { fuelType: string } | undefined;
}

export async function checkVehicleTypeIfExist(
  vehicleType: string,
): Promise<{ vehicleType: string } | undefined> {
  "use cache";
  cacheLife("max");
  cacheTag(`cars:vehicle:${vehicleType}`);

  const result = await findEntity(VEHICLE_TYPE_CHECK, vehicleType);
  return result as { vehicleType: string } | undefined;
}
