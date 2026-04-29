import ExcelJS from "exceljs";

const MONTH_MAP: Record<string, string> = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

/**
 * Column mapping from XLSX column position to database column name.
 * Index 0 = column A (SN), index 1 = column B (Make), etc.
 */
const COLUMN = [
  "sn",
  "make",
  "model",
  "coeCat",
  "engineCapacity",
  "maxPowerOutput",
  "fuelType",
  "co2",
  "vesBanding",
  "omv",
  "gstExciseDuty",
  "arf",
  "vesSurchargeRebate",
  "eeai",
  "registrationFee",
  "coePremium",
  "totalBasicCostWithoutCoe",
  "totalBasicCostWithCoe",
  "sellingPriceWithoutCoe",
  "sellingPriceWithCoe",
  "differenceWithoutCoe",
  "differenceWithCoe",
];

/** Columns where "-" should be converted to null */
const NULLABLE_NUMERIC_COLUMNS = new Set([
  "differenceWithoutCoe",
  "differenceWithCoe",
]);

/** Columns that should remain as text (not coerced to number) */
const TEXT_COLUMNS = new Set([
  "make",
  "model",
  "coeCat",
  "engineCapacity",
  "fuelType",
  "vesBanding",
]);

/**
 * Parses the sheet name (e.g. "Jan 2026") into YYYY-MM format.
 */
function parseMonthFromSheetName(sheetName: string): string {
  const parts = sheetName.trim().split(/\s+/);
  if (parts.length !== 2) {
    throw new Error(`Unexpected sheet name format: "${sheetName}"`);
  }

  const [monthAbbreviation, year] = parts;
  const monthNumber = MONTH_MAP[monthAbbreviation];
  if (!monthNumber) {
    throw new Error(`Unknown month abbreviation: "${monthAbbreviation}"`);
  }

  return `${year}-${monthNumber}`;
}

/**
 * Extracts cell value, handling ExcelJS rich text objects.
 */
function getCellValue(cell: ExcelJS.Cell): unknown {
  const value = cell.value;

  if (value && typeof value === "object" && "richText" in value) {
    return (value as ExcelJS.CellRichTextValue).richText
      .map((part) => part.text)
      .join("");
  }

  return value;
}

/**
 * Processes an LTA Car Cost Update XLSX buffer and returns parsed records.
 *
 * @param buffer - The XLSX file as an ArrayBuffer
 * @returns Object containing the month (YYYY-MM) and parsed records
 */
export async function processCarCostXlsx<T>(
  buffer: ArrayBuffer,
): Promise<{ month: string; records: T[] }> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    throw new Error("No worksheets found in workbook");
  }

  const month = parseMonthFromSheetName(worksheet.name);
  const records: T[] = [];

  worksheet.eachRow((row, rowNumber) => {
    // Skip header rows (1-3)
    if (rowNumber <= 3) return;

    // Check if this is a data row:
    // 1. SN (col A) must be a number
    // 2. Make (col B) must be a short string (footnotes contain long paragraphs)
    const serialNumber = getCellValue(row.getCell(1));
    if (typeof serialNumber !== "number") return;

    const makeValue = getCellValue(row.getCell(2));
    const makeString = makeValue == null ? "" : String(makeValue).trim();
    if (makeString.length === 0 || makeString.length > 30) return;

    const record: Record<string, unknown> = { month };

    for (let index = 0; index < COLUMN.length; index++) {
      const columnName = COLUMN[index];
      const rawValue = getCellValue(row.getCell(index + 1));

      if (TEXT_COLUMNS.has(columnName)) {
        const stringValue = rawValue == null ? null : String(rawValue).trim();
        record[columnName] = stringValue === "" ? null : stringValue;
      } else if (NULLABLE_NUMERIC_COLUMNS.has(columnName)) {
        record[columnName] =
          rawValue === "-" || rawValue == null ? null : Number(rawValue);
      } else {
        record[columnName] =
          rawValue == null || rawValue === "" ? 0 : Number(rawValue);
      }
    }

    records.push(record as T);
  });

  console.log(
    `Parsed ${records.length} car cost records for month ${month} from sheet "${worksheet.name}"`,
  );

  return { month, records };
}
