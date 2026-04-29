import { carCosts } from "@motormetrics/database";
import type { CarCost } from "@motormetrics/types";
import { updateFromXlsx } from "@web/lib/updater";

const CAR_COST_UPDATE_URL =
  "https://onemotoring.lta.gov.sg/content/dam/onemotoring/Buying/Car_Cost_Update/M032-Car_Cost_Update.xlsx";

export function updateCarCosts() {
  return updateFromXlsx<CarCost>({
    table: carCosts,
    url: CAR_COST_UPDATE_URL,
  });
}
