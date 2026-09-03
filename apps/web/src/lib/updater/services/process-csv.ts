import fs from "node:fs";
import Papa, { type ParseConfig } from "papaparse";

export interface CSVTransformOptions<_T> {
  fields?: Record<string, (value: string) => unknown>;
  columnMapping?: Record<string, string>;
  /**
   * PapaParse dynamic typing. Defaults to true. Disable for files where
   * numeric-looking strings must survive intact, such as postal codes with
   * leading zeros.
   */
  dynamicTyping?: boolean;
}

export async function processCsv<T>(
  filePath: string,
  options: CSVTransformOptions<T> = {},
) {
  const fileContent = fs.readFileSync(filePath, "utf-8");

  const { fields = {}, columnMapping = {}, dynamicTyping = true } = options;

  const parseConfig: ParseConfig<T> = {
    header: true,
    dynamicTyping,
    skipEmptyLines: true,
    transformHeader: (header) => columnMapping[header] || header,
    transform: (value, field) => {
      const fieldKey = String(field);

      if (fields[fieldKey]) {
        return fields[fieldKey](value);
      }

      return typeof value === "string" ? value.trim() : value;
    },
  };

  const { data } = Papa.parse<T>(fileContent, parseConfig);

  return data;
}
