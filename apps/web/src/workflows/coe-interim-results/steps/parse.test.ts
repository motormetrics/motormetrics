import {
  ClosingResultsParseError,
  parseClosingResults,
} from "@web/workflows/coe-interim-results/steps/parse";
import { describe, expect, it } from "vitest";

// A hand-written page with the same headings and table structure as the
// OneMotoring COE Open Bidding page, carrying the November 2026 2nd exercise
// figures (confirmed against the DataMall CSV). Not a copy of LTA's page.
const quotaRows = [
  ["A", "1,193", "130,100", "132,668"],
  ["B", "951", "125,600", "131,323"],
  ["C", "314", "91,790", "92,188"],
  ["D", "506", "10,489", "11,288"],
  ["E", "266", "136,000", "0"],
];
const bidRows = [
  ["A", "1,464", "1,130", "334", "63"],
  ["B", "1,066", "951", "115", "0"],
  ["C", "504", "314", "190", "0"],
  ["D", "635", "499", "136", "7"],
  ["E", "466", "225", "241", "41"],
];

const cells = (values: string[]) =>
  values.map((value) => `<td class="align-right">${value}</td>`).join("");

const page = ({
  ended = "NOVEMBER 2026 2nd Open Bidding Exercise has ended on 18/11/2026 16:00:00 hrs",
  results = "Results for NOVEMBER 2026 2nd Open Bidding Exercise",
  quota = quotaRows,
  bids = bidRows,
}: {
  ended?: string | null;
  results?: string;
  quota?: string[][];
  bids?: string[][];
} = {}) => `<main>
  ${ended === null ? "" : `<p><strong>${ended}</strong></p>`}
  <h3>${results}</h3>
  <table><tbody>
    <tr><th colspan="2">Category</th><th>Quota</th><th>QP($)</th><th>PQP($)</th></tr>
    ${quota.map(([letter, ...rest]) => `<tr><td>${letter}</td><td>DESCRIPTION &amp; DETAILS</td>${cells(rest)}</tr>`).join("")}
  </tbody></table>
  <table><tbody>
    <tr><th colspan="2">Category</th><th>Received</th><th>Successful</th><th>Unsuccessful</th><th>Unused</th></tr>
    ${bids.map(([letter, ...rest]) => `<tr><td>${letter}</td><td>DESCRIPTION</td>${cells(rest)}</tr>`).join("")}
  </tbody></table>
</main>`;

const TODAY = "2026-11-18";

describe("parseClosingResults", () => {
  it("should read the closing results of an exercise that ended today", () => {
    const parsed = parseClosingResults(page(), TODAY);

    expect(parsed).toMatchObject({
      status: "closed",
      endedOn: "2026-11-18",
      month: "2026-11",
      biddingNo: 2,
    });
    if (parsed.status !== "closed") return;

    expect(parsed.results).toEqual([
      {
        month: "2026-11",
        biddingNo: 2,
        vehicleClass: "Category A",
        quota: 1193,
        premium: 130100,
        bidsReceived: 1464,
        bidsSuccess: 1130,
      },
      {
        month: "2026-11",
        biddingNo: 2,
        vehicleClass: "Category B",
        quota: 951,
        premium: 125600,
        bidsReceived: 1066,
        bidsSuccess: 951,
      },
      {
        month: "2026-11",
        biddingNo: 2,
        vehicleClass: "Category C",
        quota: 314,
        premium: 91790,
        bidsReceived: 504,
        bidsSuccess: 314,
      },
      {
        month: "2026-11",
        biddingNo: 2,
        vehicleClass: "Category D",
        quota: 506,
        premium: 10489,
        bidsReceived: 635,
        bidsSuccess: 499,
      },
      {
        month: "2026-11",
        biddingNo: 2,
        vehicleClass: "Category E",
        quota: 266,
        premium: 136000,
        bidsReceived: 466,
        bidsSuccess: 225,
      },
    ]);
  });

  it("should read the 1st exercise as bidding number 1", () => {
    const parsed = parseClosingResults(
      page({
        ended:
          "DECEMBER 2026 1st Open Bidding Exercise has ended on 02/12/2026 16:00:00 hrs",
        results: "Results for DECEMBER 2026 1st Open Bidding Exercise",
      }),
      "2026-12-02",
    );

    expect(parsed).toMatchObject({ month: "2026-12", biddingNo: 1 });
  });

  it("should be stale when the latest exercise ended before today", () => {
    expect(parseClosingResults(page(), "2026-11-20")).toEqual({
      status: "stale",
      endedOn: "2026-11-18",
    });
  });

  it("should not have ended when the page has no closing heading", () => {
    expect(parseClosingResults(page({ ended: null }), TODAY)).toEqual({
      status: "not-ended",
    });
  });

  it.each([
    ["an end date after today", page(), "2026-11-17", "ended-date"],
    [
      "a results heading for another exercise",
      page({ results: "Results for NOVEMBER 2026 1st Open Bidding Exercise" }),
      TODAY,
      "results-heading",
    ],
    [
      "a missing category",
      page({ quota: quotaRows.slice(0, 4) }),
      TODAY,
      "quota-table",
    ],
    [
      "a missing bids table",
      page().replace(/<table>(?![\s\S]*<table>)[\s\S]*<\/table>/, ""),
      TODAY,
      "bids-table",
    ],
    [
      "a figure that is not a number",
      page({
        quota: [["A", "1,193", "N/A", "0"], ...quotaRows.slice(1)],
      }),
      TODAY,
      "category-A",
    ],
    [
      "a zero premium",
      page({ quota: [["A", "1,193", "0", "0"], ...quotaRows.slice(1)] }),
      TODAY,
      "category-A",
    ],
    [
      "more successful bids than quota",
      page({
        bids: [["A", "2,000", "1,500", "500", "0"], ...bidRows.slice(1)],
      }),
      TODAY,
      "category-A",
    ],
  ])("should throw on %s", (_, html, today, check) => {
    expect(() => parseClosingResults(html, today)).toThrow(
      ClosingResultsParseError,
    );
    try {
      parseClosingResults(html, today);
    } catch (error) {
      expect(error).toBeInstanceOf(ClosingResultsParseError);
      expect((error as ClosingResultsParseError).check).toBe(check);
    }
  });
});
