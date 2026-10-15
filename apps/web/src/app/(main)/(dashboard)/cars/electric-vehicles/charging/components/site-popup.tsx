import {
  describeConnectors,
  siteTitle,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/utils/describe-connectors";
import type { EvChargingMapSite } from "@web/queries/ev-charging/map-sites";

/** A site's name, address, free connectors and pricing, shown on click. */
export function SitePopup({ site }: { site: EvChargingMapSite }) {
  const title = siteTitle(site);
  const usable = site.connectors - site.unavailable;

  return (
    <div className="flex flex-col gap-1 pr-4 text-xs">
      <p className="font-semibold text-foreground">{title}</p>
      {site.address && site.address !== title ? (
        <p className="text-muted">{site.address}</p>
      ) : null}
      <p className="font-semibold tabular-nums">
        {site.available} of {usable} free
        {site.unavailable > 0 ? ` · ${site.unavailable} out of service` : ""}
      </p>
      <p className="text-muted">
        {[
          site.operator,
          describeConnectors(site),
          site.minPricePerKwh != null
            ? `from $${site.minPricePerKwh.toFixed(2)}/kWh`
            : null,
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>
    </div>
  );
}
