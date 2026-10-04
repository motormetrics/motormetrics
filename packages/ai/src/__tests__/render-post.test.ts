import { describe, expect, it } from "vitest";
import {
  collectCategories,
  collectHighlights,
  renderPostContent,
} from "../render-post";
import type { GeneratedPost, PostChart } from "../schemas";

const chart: PostChart = {
  type: "bar",
  title: " Registrations\u0000 rose ",
  subtitle: " All\n fuels ",
  unit: "count",
  valueLabel: " New\t cars ",
  data: [{ label: " Toy\u007fota ", value: 100 }],
};
const post: GeneratedPost = {
  title: "July cars",
  excerpt: "Market summary",
  lead: " More\n cars   arrived. ",
  tags: ["Cars"],
  sections: [
    {
      categories: ["cars", "coe"],
      heading: " Registrations\t increased ",
      body: "  First paragraph.\n\nSecond paragraph.  ",
      charts: [chart],
      highlights: [
        { value: "100", label: "Cars", detail: "New registrations" },
      ],
    },
  ],
};

describe("renderPostContent", () => {
  it("cleans headings and chart text, preserving prose and numeric values", () => {
    const original = structuredClone(post);
    const rendered = renderPostContent(post);
    expect(rendered).toBe(
      [
        "More cars arrived.",
        "## Registrations increased",
        "First paragraph.\n\nSecond paragraph.",
        "```chart\n" +
          JSON.stringify({
            ...chart,
            title: "Registrations rose",
            subtitle: "All fuels",
            valueLabel: "New cars",
            data: [{ label: "Toy ota", value: 100 }],
          }) +
          "\n```",
      ].join("\n\n"),
    );
    expect(post).toEqual(original);
  });

  it("serialises charts with null optional labels as valid JSON", () => {
    const rendered = renderPostContent({
      ...post,
      sections: [
        {
          ...post.sections[0],
          charts: [{ ...chart, subtitle: null, valueLabel: null }],
        },
      ],
    });
    const json = rendered.split("```chart\n")[1].split("\n```")[0];
    expect(JSON.parse(json)).toMatchObject({
      subtitle: null,
      valueLabel: null,
      data: [{ label: "Toy ota", value: 100 }],
    });
  });

  it("renders the lead when no sections exist", () => {
    expect(renderPostContent({ ...post, sections: [] })).toBe(
      "More cars arrived.",
    );
  });
});

describe("collectHighlights", () => {
  it("flattens highlights in section order", () => {
    const second = { value: "$100,000", label: "COE", detail: "Premium" };
    expect(
      collectHighlights({
        ...post,
        sections: [
          ...post.sections,
          { ...post.sections[0], highlights: [second] },
        ],
      }),
    ).toEqual([...post.sections[0].highlights, second]);
  });
  it("returns no highlights for an empty post", () => {
    expect(collectHighlights({ ...post, sections: [] })).toEqual([]);
  });
});

describe("collectCategories", () => {
  it("deduplicates categories in first-use order", () => {
    expect(
      collectCategories([
        ...post.sections,
        {
          ...post.sections[0],
          categories: ["coe", "pqp", "cars", "deregistrations"],
        },
      ]),
    ).toEqual(["cars", "coe", "pqp", "deregistrations"]);
  });
  it("returns an empty list for sections without categories", () => {
    expect(
      collectCategories([{ ...post.sections[0], categories: [] }]),
    ).toEqual([]);
    expect(collectCategories([])).toEqual([]);
  });
});
