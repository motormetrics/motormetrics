import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";

type TypeCategory = "fuel-types" | "vehicle-types";

const NOUNS: Record<TypeCategory, string> = {
  "fuel-types": "fuel type",
  "vehicle-types": "vehicle type",
};

/**
 * Title, description and canonical path for a type page, shared by
 * `generateMetadata` and the WebPage structured data so the two never drift.
 * `value` is the LTA value; the slug stands in when it does not resolve.
 */
export function typeDetailMeta(
  category: TypeCategory,
  type: string,
  value: string | undefined,
): { title: string; description: string; canonical: string } {
  const displayName = value
    ? category === "vehicle-types"
      ? formatVehicleType(value)
      : value
    : type;

  return {
    title: `${displayName} Cars in Singapore`,
    description: `${displayName} car registrations in Singapore. Explore registration trends, statistics, and distribution by ${NOUNS[category]} for each month.`,
    canonical: `/cars/${category}/${type}`,
  };
}
