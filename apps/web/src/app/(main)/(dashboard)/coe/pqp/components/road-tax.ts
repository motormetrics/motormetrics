/** The fuel types the renewal calculator prices road tax for. */
export type FuelType = "petrol" | "hybrid" | "electric" | "diesel";

export interface RoadTaxInput {
  fuel: FuelType;
  /** Engine capacity in cc; unused for electric cars. */
  engineCapacity: number;
  /** Maximum motor power in kW; used for electric and hybrid cars. */
  powerRating: number;
}

export interface RoadTax {
  /** Road tax a year, before any age surcharge. */
  base: number;
  /** The electric car Additional Flat Component or diesel special tax a year. */
  extra: number;
}

/** LTA's multiplier on every 6-monthly road tax formula. */
const RATE_FACTOR = 0.782;

/** The electric car Additional Flat Component, every 6 months. */
const ADDITIONAL_FLAT_COMPONENT = 350;

/** 6-monthly road tax for petrol cars, by engine capacity in cc. */
const byEngineCapacity = (cc: number) =>
  RATE_FACTOR *
  (cc <= 600
    ? 200
    : cc <= 1000
      ? 200 + 0.125 * (cc - 600)
      : cc <= 1600
        ? 250 + 0.375 * (cc - 1000)
        : cc <= 3000
          ? 475 + 0.75 * (cc - 1600)
          : 1525 + (cc - 3000));

/** 6-monthly road tax for electric cars, by power rating in kW. */
const byPowerRating = (kw: number) =>
  RATE_FACTOR *
  (kw <= 7.5
    ? 200
    : kw <= 30
      ? 200 + 2 * (kw - 7.5)
      : kw <= 230
        ? 250 + 3.75 * (kw - 30)
        : 1525 + 10 * (kw - 230));

/**
 * A year's road tax under LTA's tax structure.
 *
 * Hybrids pay the higher of the engine and motor figures. Diesel assumes a
 * Euro V or newer engine: S$0.20 per cc less S$100, at least S$100, every 6
 * months. Both open points are tracked in #1496.
 */
export const getRoadTax = ({
  engineCapacity,
  fuel,
  powerRating,
}: RoadTaxInput): RoadTax => {
  const sixMonthly =
    fuel === "electric"
      ? byPowerRating(powerRating)
      : fuel === "hybrid"
        ? Math.max(byEngineCapacity(engineCapacity), byPowerRating(powerRating))
        : byEngineCapacity(engineCapacity);

  const sixMonthlyExtra =
    fuel === "electric"
      ? ADDITIONAL_FLAT_COMPONENT
      : fuel === "diesel"
        ? Math.max(0.2 * engineCapacity - 100, 100)
        : 0;

  return { base: sixMonthly * 2, extra: sixMonthlyExtra * 2 };
};

/**
 * The age surcharge over a renewal term, as a multiple of a year's road tax.
 *
 * Cars beyond 10 years old pay 10% more, rising 10 points a year to 50%
 * beyond 14 years. It applies to road tax only, not the flat or special tax.
 */
export const getSurchargeYears = (ageAtExpiry: number, years: number) => {
  let total = 0;
  for (let year = 1; year <= years; year += 1) {
    const yearsBeyondTen = ageAtExpiry + year - 10;
    total += Math.min(Math.max(yearsBeyondTen, 0) * 0.1, 0.5);
  }
  return total;
};
