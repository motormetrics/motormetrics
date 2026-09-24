import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { slugify } from "@motormetrics/utils/slugify";
import { BarRow } from "@web/components/shared/bar-row";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import { SectionHead } from "@web/components/shared/overview";
import { getTopMakesByYear } from "@web/queries/cars";
import { getCarLogoMap } from "@web/queries/logos";
import { getLatestMonth } from "@web/utils/dates/months";

const ROW_COUNT = 5;

/** The five best-selling makes for the selected month's year. */
export async function TopMakes() {
  const month = await getLatestMonth("cars");
  const year = Number(month.slice(0, 4));
  const [makes, logoUrlBySlug] = await Promise.all([
    getTopMakesByYear(year, ROW_COUNT),
    getCarLogoMap(),
  ]);

  if (makes.length === 0) {
    return null;
  }

  const leader = makes[0].value || 1;

  return (
    <section className="flex flex-col gap-6">
      <SectionHead
        caption={`${year} year to date`}
        eyebrow="Registrations"
        link={{ href: "/cars/makes", label: "All makes" }}
        title="Top makes"
      />
      <div className="flex flex-col gap-3.5">
        {makes.map((item, index) => (
          <BarRow
            color={`var(--chart-${index + 1})`}
            key={item.make}
            label={
              <>
                <MakeAvatar
                  logoUrl={logoUrlBySlug[slugify(item.make)] ?? null}
                  make={item.make}
                  size={28}
                />
                <Typography.Paragraph
                  className="[color:inherit] [font-weight:inherit]"
                  truncate
                >
                  {item.make}
                </Typography.Paragraph>
              </>
            }
            share={(item.value / leader) * 100}
            value={
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={item.value}
              />
            }
          />
        ))}
      </div>
    </section>
  );
}
