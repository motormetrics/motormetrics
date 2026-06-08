export const tokeniser = (
  data: Record<string, unknown>[] | null | undefined,
): string => {
  if (!data || data.length === 0) {
    return "";
  }

  const firstItem = data[0];
  if (!firstItem) {
    return "";
  }

  const headers = Object.keys(firstItem);
  const headerLine = headers.join("|");

  const formattedData = data
    .map((item) => {
      const values = headers.map((header) => {
        const value = item[header];
        return value !== null && value !== undefined ? String(value) : "";
      });
      return values.join("|");
    })
    .join("\n");

  return `${headerLine}\n${formattedData}`;
};
