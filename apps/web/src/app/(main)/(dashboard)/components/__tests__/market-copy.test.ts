import { signed } from "@web/app/(main)/(dashboard)/components/market-copy";
import { describe, expect, it } from "vitest";

describe("signed", () => {
  it("should prefix a plus or a true minus", () => {
    expect(signed(5.25)).toBe("+5.3%");
    expect(signed(-0.4)).toBe("−0.4%");
    expect(signed(-5.5, " pts")).toBe("−5.5 pts");
  });
});
