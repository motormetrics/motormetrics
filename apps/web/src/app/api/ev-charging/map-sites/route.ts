import { getEvChargingMapSites } from "@web/queries/ev-charging";
import { NextResponse } from "next/server";

/**
 * The charger map's site list, as a resource the map fetches on mount.
 *
 * The same data used to travel as props to `ChargingMapView`, which put all
 * 2,755 sites into the RSC payload of every visit — and twice over, since a
 * page serves a prerender stream and a resume stream. Served from here it
 * leaves the document entirely and the CDN and browser can cache it across
 * navigations.
 *
 * `getEvChargingMapSites` carries its own `"use cache"` and cache tag, so the
 * `ev-charging-live` workflow's revalidation refreshes this route too.
 */
export async function GET() {
  try {
    const sites = await getEvChargingMapSites();
    return NextResponse.json(sites, {
      headers: {
        "cache-control":
          "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error fetching EV charging map sites:", error);
    return NextResponse.json(
      { error: "Failed to fetch charging map sites" },
      { status: 500 },
    );
  }
}
