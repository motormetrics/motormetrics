import { cn, ProgressBar } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { slugify } from "@motormetrics/utils/slugify";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { getTopMakesByYear, getYearToDateByFuelType } from "@web/queries/cars";
import { getCarLogoMap } from "@web/queries/logos";
import { formatMonthName } from "@web/utils/dates/format-month";
import { getLatestMonth } from "@web/utils/dates/months";
import type { CSSProperties } from "react";

const ROW_COUNT = 5;

/**
 * Rank, make, bar, cars and share, shared by the header and every row so the
 * columns line up. The bar drops out on phones and the make takes its room.
 */
const ROW = "flex items-center gap-3 max-md:gap-2.5";
const RANK_CELL = "w-5 shrink-0";
const MAKE_CELL = "w-38 shrink-0 max-md:min-w-0 max-md:flex-1";
const BAR_CELL = "min-w-0 flex-1 max-md:hidden";
const CARS_CELL = "w-16 shrink-0 text-right max-md:w-14";
const SHARE_CELL = "w-13 shrink-0 text-right max-md:w-12";

/**
 * The five best-selling makes this year, each with its share of every new
 * car registered. The bars are scaled to the leader.
 */
export async function TopMakes() {
  const month = await getLatestMonth("cars");
  const year = Number(month.slice(0, 4));
  const [makes, fuelTypes, logoUrlBySlug] = await Promise.all([
    getTopMakesByYear(year, ROW_COUNT),
    getYearToDateByFuelType(year),
    getCarLogoMap(),
  ]);

  const total = fuelTypes.reduce((sum, item) => sum + item.count, 0);
  if (makes.length === 0 || total === 0) {
    return null;
  }

  const leader = makes[0].value || 1;

  return (
    <section className="flex min-w-0 flex-col gap-4.5">
      <SectionHead
        caption={
          <>
            {year} year to date · share of{" "}
            <NumberValue
              locale="en-SG"
              maximumFractionDigits={0}
              value={total}
            />{" "}
            new cars
          </>
        }
        eyebrow="Registrations"
        link={{ href: "/cars/makes", label: "All makes" }}
        title="Top makes"
      />

      <div className="flex flex-col">
        <div
          className={cn(
            ROW,
            "border-border border-b pb-2 font-semibold text-muted text-xs",
          )}
        >
          <span className={RANK_CELL}>#</span>
          <span className={MAKE_CELL}>Make</span>
          <span className={BAR_CELL} />
          <span className={CARS_CELL}>Cars</span>
          <span className={SHARE_CELL}>Share</span>
        </div>
        <ol className="flex flex-col">
          {makes.map((item, index) => (
            <li
              className={cn(ROW, "border-separator border-b py-2.5")}
              key={item.make}
            >
              <span
                className={cn(RANK_CELL, "text-muted text-sm tabular-nums")}
              >
                {index + 1}
              </span>
              <span className={cn(MAKE_CELL, "flex items-center gap-2.5")}>
                <MakeAvatar
                  logoUrl={logoUrlBySlug[slugify(item.make)] ?? null}
                  make={item.make}
                  size="sm"
                />
                <span className="truncate font-medium text-sm">
                  {item.make}
                </span>
              </span>
              <ProgressBar
                aria-label={`${item.make} against the leader`}
                className={BAR_CELL}
                style={
                  {
                    "--progress-bar-fill":
                      index === 0 ? "var(--chart-1)" : "var(--chart-3)",
                  } as CSSProperties
                }
                value={(item.value / leader) * 100}
              >
                <ProgressBar.Track>
                  <ProgressBar.Fill />
                </ProgressBar.Track>
              </ProgressBar>
              <span
                className={cn(CARS_CELL, "font-semibold text-sm tabular-nums")}
              >
                <NumberValue
                  locale="en-SG"
                  maximumFractionDigits={0}
                  value={item.value}
                />
              </span>
              <span
                className={cn(
                  SHARE_CELL,
                  "text-muted-strong text-sm tabular-nums",
                )}
              >
                {((item.value / total) * 100).toFixed(1)}%
              </span>
            </li>
          ))}
        </ol>
      </div>

      <SourceNote>
        New car registrations by make, January to {formatMonthName(month)}{" "}
        {year}.
      </SourceNote>
    </section>
  );
}
