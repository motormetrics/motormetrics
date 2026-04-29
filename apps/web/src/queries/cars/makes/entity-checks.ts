import { cars, db, ilike } from "@motormetrics/database";
import { cacheLife, cacheTag } from "next/cache";

function normalisePattern(input: string) {
  return input.replaceAll("-", "%");
}

interface EntityCheckConfig {
  column: typeof cars.make | typeof cars.fuelType | typeof cars.vehicleType;
  fieldName: "make" | "fuelType" | "vehicleType";
  normalise: boolean;
}

const MAKE_CHECK: EntityCheckConfig = {
  column: cars.make,
  fieldName: "make",
  normalise: false,
};

const FUEL_TYPE_CHECK: EntityCheckConfig = {
  column: cars.fuelType,
  fieldName: "fuelType",
  normalise: true,
};

const VEHICLE_TYPE_CHECK: EntityCheckConfig = {
  column: cars.vehicleType,
  fieldName: "vehicleType",
  normalise: true,
};

function findEntity(config: EntityCheckConfig, value: string) {
  const pattern = config.normalise ? normalisePattern(value) : value;
  return db.query.cars.findFirst({
    where: ilike(config.column, pattern),
    columns: { [config.fieldName]: true } as Record<string, true>,
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
