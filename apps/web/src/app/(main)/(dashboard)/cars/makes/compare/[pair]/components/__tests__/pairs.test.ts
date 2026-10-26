import {
  COMPARE_PAIRS,
  findPair,
  otherPairs,
  pairSlug,
  pairsWithMake,
} from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/pairs";
import { describe, expect, it } from "vitest";

describe("pairs", () => {
  it("should join a pair with -vs-", () => {
    expect(pairSlug(["bmw", "mercedes-benz"])).toBe("bmw-vs-mercedes-benz");
  });

  it("should find every curated pair by its slug", () => {
    for (const pair of COMPARE_PAIRS) {
      expect(findPair(pairSlug(pair))).toEqual(pair);
    }
  });

  it("should not find the reversed order, a self-pair or an unknown slug", () => {
    expect(findPair("mercedes-benz-vs-bmw")).toBeUndefined();
    expect(findPair("bmw-vs-bmw")).toBeUndefined();
    expect(findPair("foo")).toBeUndefined();
  });

  it("should list the other pairs in canonical order", () => {
    expect(otherPairs("bmw-vs-audi").map(pairSlug)).toEqual([
      "bmw-vs-mercedes-benz",
      "mercedes-benz-vs-audi",
      "byd-vs-tesla",
      "toyota-vs-honda",
      "byd-vs-toyota",
    ]);
  });

  it("should list the pairs a make appears in, on either side", () => {
    expect(pairsWithMake("audi").map(pairSlug)).toEqual([
      "bmw-vs-audi",
      "mercedes-benz-vs-audi",
    ]);
    expect(pairsWithMake("byd").map(pairSlug)).toEqual([
      "byd-vs-tesla",
      "byd-vs-toyota",
    ]);
  });

  it("should list no pairs for a make outside the curated list", () => {
    expect(pairsWithMake("volvo")).toEqual([]);
  });
});
