import { getResultsWindow } from "@web/lib/coe/results-window";
import { describe, expect, it } from "vitest";

// Wednesday 18 November 2026, given as SGT wall-clock times.
const sgt = (time: string, date = "2026-11-18") =>
  new Date(`${date}T${time}:00+08:00`);

describe("getResultsWindow", () => {
  it("should return 15:55–16:45 SGT on a weekday", () => {
    expect(getResultsWindow(sgt("09:00"))).toEqual({
      start: sgt("15:55").getTime(),
      end: sgt("16:45").getTime(),
    });
  });

  it("should return nothing once the window has ended", () => {
    expect(getResultsWindow(sgt("16:45"))).toBeNull();
    expect(getResultsWindow(sgt("23:00"))).toBeNull();
  });

  it("should return nothing at the weekend", () => {
    expect(getResultsWindow(sgt("16:00", "2026-11-21"))).toBeNull();
    expect(getResultsWindow(sgt("16:00", "2026-11-22"))).toBeNull();
  });
});
