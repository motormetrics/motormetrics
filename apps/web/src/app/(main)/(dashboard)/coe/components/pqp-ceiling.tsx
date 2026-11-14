import { loadCoeOverview } from "@web/app/(main)/(dashboard)/coe/components/overview-loader";
import {
  PqpTilesSelected,
  PqpTilesView,
} from "@web/app/(main)/(dashboard)/coe/components/pqp-tiles-view";
import { coeOverviewSearchParams } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { SourceNote } from "@web/components/shared/overview";
import { Suspense } from "react";

/**
 * The PQP renewal section of /coe, in the static shell: the fallback tints
 * the default category, and the client view the category in the URL.
 */
export async function PqpCeiling() {
  const data = await loadCoeOverview();

  if (!data?.pqp) {
    return null;
  }

  return (
    <div className="@container flex flex-col gap-4">
      <Suspense
        fallback={
          <PqpTilesView
            categoryKey={coeOverviewSearchParams.category.defaultValue}
            data={data}
          />
        }
      >
        <PqpTilesSelected data={data} />
      </Suspense>
      <SourceNote>
        Source: LTA · Three-month moving average of quota premiums, set by LTA.
        A 5-year renewal costs half the PQP. No PQP for Category E.
      </SourceNote>
    </div>
  );
}
