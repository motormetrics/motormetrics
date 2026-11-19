import { describe, expect, it } from "vitest";
import { getUniqueMonths } from "./get-unique-months";

describe("getUniqueMonths", () => {
  it("should return a unique set of dates", () => {
    const dates = [
      { key: "2023-04" },
      { key: "2023-04" },
      { key: "2023-04" },
      { key: "2023-01" },
      { key: "2023-02" },
      { key: "2023-03" },
    ];

    const result = ["2023-01", "2023-02", "2023-03", "2023-04"];

    expect(getUniqueMonths(dates, "key")).toHaveLength(4);
    expect(getUniqueMonths(dates, "key")).toEqual(result);
  });
});
