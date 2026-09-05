import { coe, pqp } from "@motormetrics/database";
import type { COE, PQP } from "@motormetrics/types";
import { LTA_DATAMALL_BASE_URL } from "@web/config/workflow";
import { update } from "@web/lib/updater";
import { fetchAndExtractZip } from "@web/lib/updater/services/download-file";

export async function updateCoe() {
  const filename = "COE Bidding Results.zip";
  const url = `${LTA_DATAMALL_BASE_URL}/${filename}`;

  const parseNumericString = (value: string) =>
    Number.parseInt(value.replace(/,/g, ""), 10);

  // Download and extract ZIP once for both tables
  const extractedFiles = await fetchAndExtractZip(url);
  const coeCsvPath = extractedFiles.get("M11-coe_results.csv");
  const pqpCsvPath = extractedFiles.get("M11-coe_results_pqp.csv");

  if (!coeCsvPath || !pqpCsvPath) {
    throw new Error(
      `Expected CSV files not found in ZIP. Found: ${[...extractedFiles.keys()].join(", ")}`,
    );
  }

  // Update COE bidding results
  const coeResult = await update<COE>({
    table: coe,
    filePath: coeCsvPath,
    csvTransformOptions: {
      columnMapping: {
        bidding_no: "biddingNo",
        vehicle_class: "vehicleClass",
        bids_success: "bidsSuccess",
        bids_received: "bidsReceived",
      },
      fields: {
        quota: parseNumericString,
        bidsSuccess: parseNumericString,
        bidsReceived: parseNumericString,
        premium: parseNumericString,
      },
    },
  });
  console.log("[COE]", coeResult);

  // Update COE PQP (Prevailing Quota Premium)
  const pqpResult = await update<PQP>({
    table: pqp,
    filePath: pqpCsvPath,
    csvTransformOptions: {
      columnMapping: {
        vehicle_class: "vehicleClass",
      },
      fields: {
        pqp: parseNumericString,
      },
    },
  });
  console.log("[COE PQP]", pqpResult);

  return coeResult;
}
