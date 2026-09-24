import { donutArcs, RING_CIRCUMFERENCE } from "@web/utils/charts/donut-arcs";
import { describe, expect, it } from "vitest";

describe("donutArcs", () => {
  it("should size each arc by its share of the total, less the gap", () => {
    const arcs = donutArcs([
      { color: "a", label: "Petrol", value: 75 },
      { color: "b", label: "Electric", value: 25 },
    ]);

    const [petrolDash] = arcs[0].dashArray.split(" ").map(Number);
    const [electricDash] = arcs[1].dashArray.split(" ").map(Number);

    expect(petrolDash).toBeCloseTo(RING_CIRCUMFERENCE * 0.75 - 16, 1);
    expect(electricDash).toBeCloseTo(RING_CIRCUMFERENCE * 0.25 - 16, 1);
  });

  it("should offset each arc by everything drawn before it", () => {
    const arcs = donutArcs([
      { color: "a", label: "Petrol", value: 50 },
      { color: "b", label: "Electric", value: 50 },
    ]);

    expect(Number(arcs[0].dashOffset)).toBeCloseTo(-8, 1);
    expect(Number(arcs[1].dashOffset)).toBeCloseTo(
      -(RING_CIRCUMFERENCE / 2 + 8),
      1,
    );
  });

  it("should keep a tick for a share that rounds to nothing", () => {
    const arcs = donutArcs([
      { color: "a", label: "Petrol", value: 10000 },
      { color: "b", label: "Others", value: 1 },
    ]);

    expect(arcs[1].dashArray.startsWith("2.00 ")).toBe(true);
  });

  it("should not divide by zero when every segment is empty", () => {
    expect(() =>
      donutArcs([{ color: "a", label: "Petrol", value: 0 }]),
    ).not.toThrow();
  });

  it("should place each segment after the ones before it for a given radius and gap", () => {
    const arcs = donutArcs(
      [
        { color: "a", label: "Half", value: 50 },
        { color: "b", label: "Other half", value: 50 },
      ],
      74,
      16,
    );
    const circumference = 2 * Math.PI * 74;
    const half = circumference / 2;

    expect(arcs[0].dashArray).toBe(
      `${(half - 16).toFixed(2)} ${(circumference - half + 16).toFixed(2)}`,
    );
    expect(arcs[0].dashOffset).toBe("-8.00");
    expect(arcs[1].dashOffset).toBe((-(half + 8)).toFixed(2));
  });

  it("should keep a near-zero share visible as a tick", () => {
    const [tiny] = donutArcs(
      [
        { color: "a", label: "Tiny", value: 0.001 },
        { color: "b", label: "Rest", value: 100 },
      ],
      74,
      16,
    );

    expect(tiny.dashArray.startsWith("2.00 ")).toBe(true);
  });
});
