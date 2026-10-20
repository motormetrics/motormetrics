import { SITE_TITLE, SITE_URL } from "@web/config";
import {
  generateDataCatalogSchema,
  generateDatasetSchema,
} from "@web/lib/metadata/structured-data";

const creator = { "@type": "Organization", name: SITE_TITLE, url: SITE_URL };

describe("generateDatasetSchema", () => {
  it("should include description, creator and license", () => {
    const dataset = generateDatasetSchema("coe-results");

    expect(dataset.description).toEqual(expect.any(String));
    expect(dataset).toMatchObject({ creator });
    expect(dataset.license).toEqual(expect.stringContaining("https://"));
  });
});

describe("generateDataCatalogSchema", () => {
  it("should give every child dataset a description, creator and license", () => {
    const catalog = generateDataCatalogSchema(
      "COE Data",
      "COE bidding data",
      "/coe",
      ["coe-results", "coe-premiums", "coe-pqp"],
    );
    const datasets = catalog.dataset as unknown as Record<string, unknown>[];

    expect(datasets).toHaveLength(3);
    for (const dataset of datasets) {
      expect(dataset.description).toEqual(expect.any(String));
      expect(dataset.description).not.toBe("");
      expect(dataset).toMatchObject({ "@type": "Dataset", creator });
      expect(dataset.license).toBe(
        generateDatasetSchema("coe-results").license,
      );
    }
  });
});
