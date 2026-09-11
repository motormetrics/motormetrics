import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { SectionHead } from "@web/components/shared/overview";
import { EV_CHARGING_CACHE_TAG } from "@web/lib/cache-tags";
import { getEvChargingNetworkSummary } from "@web/queries/ev-charging";
import { cacheLife, cacheTag } from "next/cache";

const LINK = {
  href: "/cars/electric-vehicles/charging",
  label: "All charging data",
};

/**
 * The registered public charging network. The live connector state and
 * per-kWh rates stay on the charging pages: they refresh hourly, and the
 * homepage carries nothing that would regenerate its shell that often.
 */
export async function EvCharging() {
  "use cache";
  cacheLife("max");
  cacheTag(EV_CHARGING_CACHE_TAG);

  const network = await getEvChargingNetworkSummary();

  if (network.connectors === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-6">
      <SectionHead
        caption="Public connectors in Singapore"
        eyebrow="Electric vehicles"
        link={LINK}
        title="EV charging"
      />
      <Typography.Paragraph className="font-medium" color="muted">
        <NumberValue
          locale="en-SG"
          maximumFractionDigits={0}
          value={network.connectors}
        />{" "}
        connectors across{" "}
        <NumberValue
          locale="en-SG"
          maximumFractionDigits={0}
          value={network.sites}
        />{" "}
        locations · live availability and rates on the charging page
      </Typography.Paragraph>
    </section>
  );
}
