import {
  GUIDE_TOPICS,
  GUIDES,
  type Guide,
  type GuideTopic,
  groupGuidesByTopic,
} from "@web/app/(main)/(site)/learn/lib/guides";
import { describe, expect, it } from "vitest";

const makeGuide = (slug: string): Guide => ({
  content: "",
  description: "",
  excerpt: "",
  lastUpdated: "2026-01-01",
  relatedLinks: [],
  relatedTerms: [],
  slug,
  term: slug.toUpperCase(),
  title: slug,
});

const topics: GuideTopic[] = [
  { caption: "", id: "first", slugs: ["a"], title: "First" },
  { caption: "", id: "second", slugs: ["b"], title: "Second" },
];

describe("groupGuidesByTopic", () => {
  it("should place every published guide under exactly one topic", () => {
    const grouped = groupGuidesByTopic();
    const slugs = grouped.flatMap(({ guides }) =>
      guides.map((guide) => guide.slug),
    );

    expect(slugs.toSorted()).toEqual(
      GUIDES.map((guide) => guide.slug).toSorted(),
    );
    expect(grouped.map(({ topic }) => topic.id)).toEqual(
      GUIDE_TOPICS.map((topic) => topic.id),
    );
  });

  it("should put a guide no topic names under the last topic", () => {
    const grouped = groupGuidesByTopic(
      [makeGuide("a"), makeGuide("c"), makeGuide("b")],
      topics,
    );

    expect(
      grouped.map(({ guides }) => guides.map((guide) => guide.slug)),
    ).toEqual([["a"], ["c", "b"]]);
  });

  it("should drop a topic with no guides", () => {
    const grouped = groupGuidesByTopic([makeGuide("b")], topics);

    expect(grouped.map(({ topic }) => topic.id)).toEqual(["second"]);
  });
});
