import { describe, expect, it } from "vitest";
import { normaliseMake } from "./normalise-make";

describe("normaliseMake", () => {
  it.each([
    // Basic makes
    { description: "BMW uppercase", input: "BMW", expected: "bmw" },
    {
      description: "Mercedes-Benz mixed casing with hyphen",
      input: "Mercedes-Benz",
      expected: "mercedes-benz",
    },
    { description: "Audi title case", input: "Audi", expected: "audi" },

    // Names with spaces
    {
      description: "Land Rover with space",
      input: "Land Rover",
      expected: "land-rover",
    },
    {
      description: "Rolls Royce with space",
      input: "Rolls Royce",
      expected: "rolls-royce",
    },
    {
      description: "Aston Martin with space",
      input: "Aston Martin",
      expected: "aston-martin",
    },

    // Logo suffixes
    { description: "BMW-logo suffix", input: "BMW-logo", expected: "bmw" },
    {
      description: "Audi logo filename",
      input: "Audi-logo.png",
      expected: "audi",
    },
    {
      description: "Mercedes logo vector suffix",
      input: "Mercedes-logo-vector",
      expected: "mercedes",
    },

    // Logo prefixes
    { description: "logo-BMW prefix", input: "logo-BMW", expected: "bmw" },
    {
      description: "logo-Mercedes prefix",
      input: "logo-Mercedes",
      expected: "mercedes",
    },

    // Special characters
    {
      description: "Citroën with diaeresis",
      input: "Citroën",
      expected: "citroen",
    },
    { description: "Škoda with caron", input: "Škoda", expected: "skoda" },
    { description: "McLaren casing", input: "McLaren", expected: "mclaren" },

    // Empty and whitespace
    { description: "empty string", input: "", expected: "" },
    { description: "spaces only", input: "   ", expected: "" },
    { description: "whitespace chars", input: "\t\n", expected: "" },

    // Numbers and mixed case
    {
      description: "BMW model suffix",
      input: "BMW M3",
      expected: "bmw-m3",
    },
    {
      description: "FORD uppercase with digits",
      input: "FORD F150",
      expected: "ford-f150",
    },
  ])("should normalise $description", ({ input, expected }) => {
    expect(normaliseMake(input)).toBe(expected);
  });
});
