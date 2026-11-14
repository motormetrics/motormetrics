"use client";

import { Button, Typography } from "@heroui/react";
import { Segment } from "@heroui-pro/react";
import type { SelectPost } from "@motormetrics/database/schema";
import { POST_CATEGORIES } from "@web/app/(main)/(site)/blog/components/post/utils";
import { PostCard } from "@web/app/(main)/(site)/blog/components/post-card";
import Link from "next/link";
import posthog from "posthog-js";
import { useState } from "react";

interface BlogListProps {
  /** Every dataType with at least one published post, alphabetical. */
  categories: string[];
  /** The post leading the page, left out of "All" but kept under its topic. */
  featuredId?: string;
  posts: SelectPost[];
  query: string;
}

const ALL = "all";

/** Cards shown before "Show all". */
const PAGE_SIZE = 12;

// Derived so a new dataType shows a real tab label instead of its raw slug.
const labels: Record<string, string> = {
  [ALL]: "All",
  ...Object.fromEntries(
    Object.entries(POST_CATEGORIES).map(([key, value]) => [key, value.label]),
  ),
};

/** Topics whose readers usually want the explainer, pointed at the guides. */
const GUIDE_HINTS: Record<string, string> = {
  coe: "How bidding works and what renewal at the PQP costs are explained in the COE and PQP guides.",
  pqp: "What renewal at the PQP costs, and when deregistering pays more, is explained in the PQP and PARF guides.",
  policy:
    "PARF rebates and deregistration value are explained step by step in the PARF guides.",
};

/**
 * The archive: a grid of post cards, newest first, under topic tabs and a
 * count.
 *
 * The tabs filter the posts already on the page rather than refetching —
 * there are dozens of posts, not thousands, and a tab that responds on the
 * next frame reads better than one that suspends.
 */
export function BlogList({
  categories,
  featuredId,
  posts,
  query,
}: BlogListProps) {
  const [topic, setTopic] = useState(ALL);
  const [showAll, setShowAll] = useState(false);

  const filtered =
    topic === ALL
      ? posts.filter((post) => post.id !== featuredId)
      : posts.filter((post) => post.dataType === topic);

  const count = filtered.length;
  const countLabel = `${topic === ALL ? "" : `${labels[topic] ?? topic} · `}${count} ${count === 1 ? "post" : "posts"}`;
  const hint = GUIDE_HINTS[topic];

  const selectTopic = (key: string) => {
    posthog.capture("blog_category_tab_changed", { category: key });
    setTopic(key);
    setShowAll(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {query ? (
          <Typography.Paragraph weight="semibold">
            Results for “{query}”
          </Typography.Paragraph>
        ) : (
          // Segment does not wrap, so the tabs scroll sideways inside this
          // wrapper on a phone instead of pushing the page wider.
          <div className="max-w-full overflow-x-auto">
            <Segment
              aria-label="Filter posts by topic"
              onSelectionChange={(key) => selectTopic(String(key))}
              selectedKey={topic}
              size="sm"
            >
              {[ALL, ...categories].map((key) => (
                <Segment.Item id={key} key={key}>
                  {labels[key] ?? key}
                </Segment.Item>
              ))}
            </Segment>
          </div>
        )}
        <Typography.Paragraph
          className="ml-auto tabular-nums"
          color="muted"
          role="status"
          size="sm"
        >
          {countLabel}
        </Typography.Paragraph>
      </div>

      {hint ? (
        <Typography.Paragraph color="muted" size="sm">
          {hint}{" "}
          <Link
            className="font-semibold text-accent-strong no-underline transition-colors hover:text-accent-deep"
            href="/learn"
          >
            Open Guides
          </Link>
        </Typography.Paragraph>
      ) : null}

      {count === 0 ? (
        <Typography.Paragraph
          className="border-border border-t border-b border-b-separator py-4"
          color="muted"
        >
          {query
            ? `No posts match “${query}”.`
            : "No posts under this topic yet."}
        </Typography.Paragraph>
      ) : (
        <div className="@container">
          {/* Cards past the first page stay in the HTML, hidden, so every
              post is linked from here before "Show all" is pressed. */}
          <div className="grid @3xl:grid-cols-2 @6xl:grid-cols-3 grid-cols-1 gap-3.5">
            {filtered.map((post, index) => (
              <PostCard
                hidden={!showAll && index >= PAGE_SIZE}
                key={post.id}
                post={post}
              />
            ))}
          </div>
        </div>
      )}

      {count > PAGE_SIZE ? (
        <Button
          className="self-center"
          onPress={() => setShowAll((current) => !current)}
          variant="outline"
        >
          {showAll ? "Show fewer" : `Show all ${count} posts`}
        </Button>
      ) : null}
    </div>
  );
}
