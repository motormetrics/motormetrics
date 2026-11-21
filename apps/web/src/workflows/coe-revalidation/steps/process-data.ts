import { coeRevalidation } from "@motormetrics/database/schema";
import type { CoeRevalidation } from "@motormetrics/types";
import { LTA_DATAMALL_BASE_URL } from "@web/config/workflow";
import { update } from "@web/lib/updater";

export const updateCoeRevalidation = () => {
  const filename = "Monthly Revalidation of COE of Existing Vehicles.zip";
  const url = `${LTA_DATAMALL_BASE_URL}/${filename}`;

  return update<CoeRevalidation>({
    table: coeRevalidation,
    url,
    csvTransformOptions: {
      fields: {
        number: (value: string) => (value === "" ? 0 : Number(value)),
      },
    },
  });
};
