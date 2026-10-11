import type { SelectPost } from "@motormetrics/database/schema";
import { BlogList } from "@web/app/(main)/(site)/blog/components/blog-list";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

// The real module imports reading-time, which needs Node's `util` and so
// cannot load in the browser runner.
vi.mock("@web/app/(main)/(site)/blog/components/post/utils", () => {
  const POST_CATEGORIES = {
    coe: { label: "COE" },
    "monthly-update": { label: "Monthly Update" },
  };

  return {
    getCategoryConfig: (post: { dataType: keyof typeof POST_CATEGORIES }) =>
      POST_CATEGORIES[post.dataType],
    getReadingTime: () => 2,
    POST_CATEGORIES,
  };
});

vi.mock("posthog-js", () => ({
  default: { capture: vi.fn() },
}));

const makePost = (index: number, dataType: string): SelectPost => ({
  content: "Body",
  createdAt: new Date(2026, 0, index + 1),
  dataType,
  embedding: null,
  excerpt: null,
  heroImage: null,
  highlights: null,
  id: `post-${index}`,
  kind: "monthly",
  metadata: null,
  modifiedAt: new Date(2026, 0, index + 1),
  month: null,
  publishedAt: new Date(2026, 0, index + 1),
  slug: `post-${index}`,
  status: "published",
  tags: null,
  title: `Post ${index}`,
});

const posts = [
  makePost(0, "monthly-update"),
  ...Array.from({ length: 13 }, (_, index) => makePost(index + 1, "coe")),
];

describe("BlogList", () => {
  it("should leave the featured post out of All but list it under its topic", async () => {
    const screen = await render(
      <BlogList
        categories={["coe", "monthly-update"]}
        featuredId="post-0"
        posts={posts}
        query=""
      />,
    );

    await expect.element(screen.getByText("13 posts")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Post 0" }).query()).toBeNull();

    await screen.getByRole("radio", { name: "Monthly Update" }).click();

    await expect
      .element(screen.getByRole("heading", { name: "Post 0" }))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText("Monthly Update · 1 post"))
      .toBeInTheDocument();
  });

  it("should show twelve posts until Show all is pressed", async () => {
    const screen = await render(
      <BlogList
        categories={["coe", "monthly-update"]}
        featuredId="post-0"
        posts={posts}
        query=""
      />,
    );

    await expect
      .poll(() => screen.getByRole("heading", { level: 3 }).all().length)
      .toBe(12);

    await screen.getByRole("button", { name: "Show all 13 posts" }).click();

    await expect
      .poll(() => screen.getByRole("heading", { level: 3 }).all().length)
      .toBe(13);
  });
});
