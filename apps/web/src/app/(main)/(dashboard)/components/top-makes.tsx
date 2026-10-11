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

/** Rank, make, bar, cars, share; the bar drops out on phones. */
const ROW_GRID =
  "grid grid-cols-[20px_150px_minmax(0,1fr)_64px_52px] items-center gap-3 max-[720px]:grid-cols-[18px_minmax(0,1fr)_56px_46px] max-[720px]:gap-2.5";

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
    <section className="flex min-w-0 flex-col gap-[18px]">
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
            ROW_GRID,
            "border-border border-b pb-2 font-semibold text-muted text-xs",
          )}
        >
          <span>#</span>
          <span>Make</span>
          <span className="max-[720px]:hidden" />
          <span className="text-right">Cars</span>
          <span className="text-right">Share</span>
        </div>
        <ol className="flex flex-col">
          {makes.map((item, index) => (
            <li
              className={cn(ROW_GRID, "border-separator border-b py-[9px]")}
              key={item.make}
            >
              <span className="text-muted text-sm tabular-nums">
                {index + 1}
              </span>
              <span className="flex min-w-0 items-center gap-2.5">
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
                className="max-[720px]:hidden"
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
              <span className="text-right font-semibold text-sm tabular-nums">
                <NumberValue
                  locale="en-SG"
                  maximumFractionDigits={0}
                  value={item.value}
                />
              </span>
              <span className="text-right text-muted-strong text-sm tabular-nums">
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
