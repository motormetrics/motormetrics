import { evChargingPoints } from "@motormetrics/database/schema";
import type { EvChargingPoint } from "@motormetrics/types";
import { toNumber, toText } from "@web/lib/ev-charging/parse-batch";
import { update } from "@web/lib/updater";
import { format, isValid, parse } from "date-fns";

const EV_CHARGING_POINTS_URL =
  "https://datamall.lta.gov.sg/content/dam/datamall/datasets/Facts_Figures/Electric-Vehicle-Charging-Network/EVChargingPoints.zip";

/** Registration dates arrive as `d/M/yyyy`; a handful of rows are malformed. */
export const toIsoDate = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = parse(trimmed, "d/M/yyyy", new Date());
  return isValid(parsed) ? format(parsed, "yyyy-MM-dd") : null;
};

export const toOutlets = (value: string): number => toNumber(value) ?? 1;

export const toPubliclyAccessible = (value: string): boolean =>
  value.trim().toLowerCase() === "yes";

export const updateEvChargingPoints = () =>
  update<EvChargingPoint>({
    table: evChargingPoints,
    url: EV_CHARGING_POINTS_URL,
    csvTransformOptions: {
      // Postal codes carry leading zeros, so keep every value a string and
      // convert the numeric columns explicitly below.
      dynamicTyping: false,
      columnMapping: {
        "EV Charger Registration Code": "registrationCode",
        "No. of Charging Outlets": "outlets",
        "charging Speed": "chargingSpeedKw",
        PostalCode: "postalCode",
        "Block/House No": "blockHouseNo",
        "Street Name": "streetName",
        "Building Name": "buildingName",
        "Floor No": "floorNo",
        "Lot No": "lotNo",
        "Is the charger publicly accessible?": "publiclyAccessible",
        "Registration Date": "registrationDate",
        "Type of Parking Lot": "parkingLotType",
      },
      fields: {
        outlets: toOutlets,
        chargingSpeedKw: toNumber,
        postalCode: toText,
        blockHouseNo: toText,
        streetName: toText,
        buildingName: toText,
        floorNo: toText,
        lotNo: toText,
        publiclyAccessible: toPubliclyAccessible,
        longitude: toNumber,
        latitude: toNumber,
        registrationDate: toIsoDate,
        parkingLotType: toText,
      },
    },
  });
