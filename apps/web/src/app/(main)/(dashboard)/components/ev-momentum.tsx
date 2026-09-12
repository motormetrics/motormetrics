import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { slugify } from "@motormetrics/utils/slugify";
import { formatMonthLabel } from "@web/app/(main)/(dashboard)/cars/components/format-month";
import {
  batteryElectricMakes,
  batteryElectricShares,
  resolveMonthIndex,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import { buildLogoMap } from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import { Headline, SectionHead } from "@web/components/shared/overview";
import { SparklineChart } from "@web/components/shared/sparkline-chart";
import { getEvMarketShare, getEvMonthlyTrend } from "@web/queries/cars";
import { getTopMakesByFuelType } from "@web/queries/cars/market-insights";
import { getAllCarLogos } from "@web/queries/logos";
import { getLatestMonth } from "@web/utils/dates/months";

/** Months of share history drawn under the figure. */
const SPARK_MONTHS = 12;
const TOP_MAKES = 3;

const formatMonthName = (month: string) => {
  const [year, monthNumber] = month.split("-").map(Number);
  return new Date(year, monthNumber - 1).toLocaleString("en-SG", {
    month: "long",
  });
};

/**
 * Battery-electric share of the month's new car registrations, its trend and
 * the three makes selling the most of them — the same framing as the EV page
 * the section links to.
 */
export async function EvMomentum() {
  const month = await getLatestMonth("cars");
  const [trend, marketShare, fuelTypes, logoResult] = await Promise.all([
    getEvMonthlyTrend(),
    getEvMarketShare(),
    getTopMakesByFuelType(month),
    getAllCarLogos(),
  ]);

  const index = resolveMonthIndex(
    trend.map((point) => point.month),
    month,
  );
  const point = trend[index];
  if (!point) {
    return null;
  }

  const shares = batteryElectricShares(trend, marketShare);
  const share = shares[index] ?? 0;
  const previousShare = index > 0 ? (shares[index - 1] ?? share) : share;
  const start = Math.max(0, index - SPARK_MONTHS + 1);
  const history = trend.slice(start, index + 1).map((entry, offset) => ({
    label: formatMonthLabel(entry.month),
    value: Number((shares[start + offset] ?? 0).toFixed(1)),
  }));

  const logoUrlBySlug = buildLogoMap(
    "logos" in logoResult ? logoResult.logos : [],
  );
  const makes = batteryElectricMakes(fuelTypes).slice(0, TOP_MAKES);
  const monthTotal = point.BEV || 1;

  return (
    <section className="flex flex-col gap-6">
      <SectionHead
        caption={`EV share of new registrations · ${formatMonthName(point.month)}`}
        eyebrow="Electric vehicles"
        link={{ href: "/cars/electric-vehicles", label: "All electric data" }}
        title="Electric momentum"
      />
      <div className="flex flex-col gap-3">
        <Headline
          delta={<DeltaChip unit="pp" value={share - previousShare} />}
          size="md"
          value={`${share.toFixed(1)}%`}
        />
        <SparklineChart
          data={history}
          height={120}
          name="EV share (%)"
          title={`Battery-electric share of new car registrations over the last ${history.length} months`}
        />
        {makes.length > 0 ? (
          <ol className="flex flex-col">
            {makes.map((item, rank) => (
              <li
                className="flex items-center gap-3.5 border-separator border-t py-3"
                key={item.make}
              >
                <span className="w-5 font-bold text-[15px] text-muted tabular-nums">
                  {rank + 1}
                </span>
                <MakeAvatar
                  logoUrl={logoUrlBySlug[slugify(item.make)] ?? null}
                  make={item.make}
                  size={28}
                />
                <Typography.Paragraph
                  className="font-semibold text-foreground/85"
                  truncate
                >
                  {item.make}
                </Typography.Paragraph>
                <span className="ml-auto font-extrabold text-base tabular-nums">
                  <NumberValue
                    locale="en-SG"
                    maximumFractionDigits={0}
                    value={item.count}
                  />
                </span>
                <span className="w-14 text-right font-semibold text-muted text-sm tabular-nums">
                  {((item.count / monthTotal) * 100).toFixed(1)}%
                </span>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </section>
  );
}
