import fs from "node:fs";
import Papa, { type ParseConfig } from "papaparse";

export interface CSVTransformOptions<_T> {
  fields?: Record<string, (value: string) => unknown>;
  columnMapping?: Record<string, string>;
}

export async function processCsv<T>(
  filePath: string,
  options: CSVTransformOptions<T> = {},
) {
  const fileContent = fs.readFileSync(filePath, "utf-8");

  const { fields = {}, columnMapping = {} } = options;

  const parseConfig: ParseConfig<T> = {
    header: true,
    dynamicTyping: true,
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
