import { slugify } from "@motormetrics/utils/slugify";
import { MakeTable } from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/make-table";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { percentageChange } from "@web/utils/change-ratio";

/** How many makes the by-make table lists before it stops. */
const MAKE_LIMIT = 15;

/** The leading makes for the vehicle type, against the same period a year earlier. */
export function VehicleTypeMakes({
  displayName,
  logoUrlBySlug,
  makes,
  periodLabel,
  previousMakes,
  typeTotal,
}: {
  displayName: string;
  logoUrlBySlug: Record<string, string>;
  makes: { count: number; make: string }[];
  periodLabel: string;
  previousMakes: { count: number; make: string }[];
  typeTotal: number;
}) {
  const previousByMake = new Map(
    previousMakes.map((row) => [row.make, row.count]),
  );
  const makeRows = makes.slice(0, MAKE_LIMIT).map(({ count, make }, index) => ({
    change: percentageChange(count, previousByMake.get(make) ?? 0),
    count,
    logoUrl: logoUrlBySlug[slugify(make)] ?? null,
    make,
    rank: index + 1,
  }));

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption={`${periodLabel}${makes.length > MAKE_LIMIT ? ` · top ${MAKE_LIMIT} of ${makes.length} makes` : ""}`}
        eyebrow="Makes"
        title={`${displayName} by make`}
      />
      <MakeTable rows={makeRows} total={typeTotal} vehicleType={displayName} />
      <SourceNote>
        Share is of {typeTotal.toLocaleString("en-SG")} {displayName}{" "}
        registrations in the period. Change compares against the same period a
        year earlier. Colour is not used for direction.
      </SourceNote>
    </section>
  );
}
