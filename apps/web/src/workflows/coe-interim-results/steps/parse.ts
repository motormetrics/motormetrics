import type { COECategory } from "@motormetrics/types";
import type { COEResult } from "@web/types";

/** The OneMotoring page the closing results are read from. */
export const COE_OPEN_BIDDING_URL =
  "https://onemotoring.lta.gov.sg/content/onemotoring/home/buying/coe-open-bidding.html";

/**
 * What the page says about the latest exercise.
 *
 * - `not-ended`: no "has ended" heading, so bidding is open or not yet
 *   announced. The layout during bidding has not been recorded yet, so a
 *   layout change that drops the heading also lands here.
 * - `stale`: the latest exercise ended before `today`, which is the page on
 *   every weekday that is not a results day.
 * - `closed`: the exercise ended today, with its results.
 */
export type ClosingResults =
  | { status: "not-ended" }
  | { status: "stale"; endedOn: string }
  | {
      status: "closed";
      endedOn: string;
      month: string;
      biddingNo: number;
      results: COEResult[];
    };

/** The page has a closing heading but its contents fail a check. */
export class ClosingResultsParseError extends Error {
  /** Which check failed, for the failure event. */
  readonly check: string;

  constructor(message: string, check: string) {
    super(message);
    this.name = "ClosingResultsParseError";
    this.check = check;
  }
}

const MONTHS: Record<string, string> = {
  JANUARY: "01",
  FEBRUARY: "02",
  MARCH: "03",
  APRIL: "04",
  MAY: "05",
  JUNE: "06",
  JULY: "07",
  AUGUST: "08",
  SEPTEMBER: "09",
  OCTOBER: "10",
  NOVEMBER: "11",
  DECEMBER: "12",
};

const ORDINALS: Record<string, number> = { "1st": 1, "2nd": 2 };

const CATEGORIES = ["A", "B", "C", "D", "E"] as const;

const ENDED_HEADING =
  /([A-Z]+) (\d{4}) (1st|2nd) Open Bidding Exercise has ended on (\d{2})\/(\d{2})\/(\d{4})/i;
const RESULTS_HEADING =
  /Results for ([A-Z]+) (\d{4}) (1st|2nd) Open Bidding Exercise/i;

const decodeEntities = (text: string): string =>
  text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"');

const toText = (html: string): string =>
  decodeEntities(html.replace(/<[^>]*>/g, " "))
    .replace(/\s+/g, " ")
    .trim();

/**
 * Every table on the page as rows of cell text. A cell's `colspan` repeats its
 * text, so header positions line up with the data cells beneath them.
 */
const readTables = (html: string): string[][][] =>
  [...html.matchAll(/<table\b[\s\S]*?<\/table>/gi)].map(([table]) =>
    [...table.matchAll(/<tr\b[\s\S]*?<\/tr>/gi)].map(([row]) =>
      [...row.matchAll(/<t([hd])\b([^>]*)>([\s\S]*?)<\/t\1>/gi)].flatMap(
        ([, , attributes, content]) => {
          const span = Number(/colspan="?(\d+)/i.exec(attributes)?.[1] ?? 1);
          return Array<string>(span).fill(toText(content));
        },
      ),
    ),
  );

const parseCount = (value: string, check: string): number => {
  const digits = value.replace(/,/g, "");
  if (!/^\d+$/.test(digits)) {
    throw new ClosingResultsParseError(`Not a whole number: "${value}"`, check);
  }
  return Number.parseInt(digits, 10);
};

/**
 * Finds the table whose header row holds every one of `headers`, and returns
 * its rows keyed by category letter, with each header's value by column.
 */
const readCategoryTable = (
  tables: string[][][],
  headers: string[],
  check: string,
): Map<string, Record<string, string>> => {
  const table = tables.find(([header]) =>
    headers.every((name) => header?.includes(name)),
  );
  if (!table) {
    throw new ClosingResultsParseError(
      `No table with headers ${headers.join(", ")}`,
      check,
    );
  }

  const [header, ...rows] = table;
  const columns = headers.map((name) => header.indexOf(name));
  const byCategory = new Map<string, Record<string, string>>();

  for (const cells of rows) {
    const [category] = cells;
    byCategory.set(
      category,
      Object.fromEntries(
        headers.map((name, index) => [name, cells[columns[index]] ?? ""]),
      ),
    );
  }

  const categories = [...byCategory.keys()];
  if (
    categories.length !== CATEGORIES.length ||
    !CATEGORIES.every((category) => byCategory.has(category))
  ) {
    throw new ClosingResultsParseError(
      `Expected categories A to E, found ${categories.join(", ") || "none"}`,
      check,
    );
  }

  return byCategory;
};

/**
 * Reads the closing results of the latest COE open bidding exercise from the
 * OneMotoring page. `today` is the SGT date as `YYYY-MM-DD`.
 *
 * Fails closed: once the page says an exercise has ended today, any heading,
 * table or number that does not check out throws `ClosingResultsParseError`
 * rather than returning partial results.
 */
export const parseClosingResults = (
  html: string,
  today: string,
): ClosingResults => {
  const text = toText(html);

  const ended = ENDED_HEADING.exec(text);
  if (!ended) {
    return { status: "not-ended" };
  }

  const [, endedMonthName, endedYear, endedOrdinal, day, month, year] = ended;
  const endedOn = `${year}-${month}-${day}`;
  if (endedOn < today) {
    return { status: "stale", endedOn };
  }
  if (endedOn > today) {
    throw new ClosingResultsParseError(
      `Exercise ended on ${endedOn}, after today (${today})`,
      "ended-date",
    );
  }

  const monthNumber = MONTHS[endedMonthName.toUpperCase()];
  const biddingNo = ORDINALS[endedOrdinal.toLowerCase()];
  if (!monthNumber || !biddingNo) {
    throw new ClosingResultsParseError(
      `Unrecognised exercise "${endedMonthName} ${endedYear} ${endedOrdinal}"`,
      "ended-heading",
    );
  }

  const resultsHeading = RESULTS_HEADING.exec(text);
  if (
    !resultsHeading ||
    resultsHeading[1].toUpperCase() !== endedMonthName.toUpperCase() ||
    resultsHeading[2] !== endedYear ||
    resultsHeading[3].toLowerCase() !== endedOrdinal.toLowerCase()
  ) {
    throw new ClosingResultsParseError(
      "Results heading is missing or names a different exercise",
      "results-heading",
    );
  }

  const tables = readTables(html);
  const premiums = readCategoryTable(tables, ["Quota", "QP($)"], "quota-table");
  const bids = readCategoryTable(
    tables,
    ["Received", "Successful"],
    "bids-table",
  );

  const results = CATEGORIES.map((letter): COEResult => {
    const premiumRow = premiums.get(letter) ?? {};
    const bidsRow = bids.get(letter) ?? {};
    const check = `category-${letter}`;

    const result: COEResult = {
      month: `${endedYear}-${monthNumber}`,
      biddingNo,
      vehicleClass: `Category ${letter}` as COECategory,
      quota: parseCount(premiumRow.Quota ?? "", check),
      premium: parseCount(premiumRow["QP($)"] ?? "", check),
      bidsReceived: parseCount(bidsRow.Received ?? "", check),
      bidsSuccess: parseCount(bidsRow.Successful ?? "", check),
    };

    if (result.quota <= 0 || result.premium <= 0) {
      throw new ClosingResultsParseError(
        `Category ${letter} quota or premium is not positive`,
        check,
      );
    }
    if (
      result.bidsSuccess > result.quota ||
      result.bidsSuccess > result.bidsReceived
    ) {
      throw new ClosingResultsParseError(
        `Category ${letter} has more successful bids than quota or bids received`,
        check,
      );
    }

    return result;
  });

  return {
    status: "closed",
    endedOn,
    month: `${endedYear}-${monthNumber}`,
    biddingNo,
    results,
  };
};
