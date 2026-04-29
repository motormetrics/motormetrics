import type { CleanSpecialCharsOptions } from "@motormetrics/types";

export const cleanSpecialChars = (
  value: string,
  options: CleanSpecialCharsOptions = {},
) => {
  const { separator = "", joinSeparator = "" } = options;

  return value
    .split(separator)
    .map((part) => part.trim())
    .join(joinSeparator);
};
