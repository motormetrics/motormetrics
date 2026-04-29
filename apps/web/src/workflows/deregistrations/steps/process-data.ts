import { deregistrations } from "@motormetrics/database";
import type { Deregistration } from "@motormetrics/types";
import { LTA_DATAMALL_BASE_URL } from "@web/config/workflow";
import { update } from "@web/lib/updater";

export const updateDeregistration = () => {
  const filename =
    "Monthly De-Registered Motor Vehicles under Vehicle Quota System (VQS).zip";
  const url = `${LTA_DATAMALL_BASE_URL}/${filename}`;

  return update<Deregistration>({
    table: deregistrations,
    url,
    csvTransformOptions: {
      fields: {
        number: (value: string | number) => (value === "" ? 0 : Number(value)),
      },
    },
  });
};
