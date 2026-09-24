"use client";

import { cn, Typography } from "@heroui/react";
import type { SelectPost } from "@motormetrics/database/schema";
import { POST_CATEGORIES } from "@web/app/(main)/(site)/blog/components/post/utils";
import { PostCard } from "@web/app/(main)/(site)/blog/components/post-card";
import posthog from "posthog-js";
import { useState } from "react";

interface BlogListProps {
  /** Every dataType with at least one published post, alphabetical. */
  categories: string[];
  posts: SelectPost[];
  query: string;
}

const ALL = "all";

// Derived so a new dataType shows a real tab label instead of its raw slug.
const labels: Record<string, string> = {
  [ALL]: "All",
  ...Object.fromEntries(
    Object.entries(POST_CATEGORIES).map(([key, value]) => [key, value.label]),
  ),
};

/**
 * The comp's "All posts" block: heading and count on the left, topic pills
 * hard right, then the three-up card grid.
 *
 * The pills filter the posts already on the page rather than refetching —
 * there are dozens of posts, not thousands, and a tab that responds on the
 * next frame reads better than one that suspends.
 */
export function BlogList({ categories, posts, query }: BlogListProps) {
  const [topic, setTopic] = useState(ALL);

  const filtered =
    topic === ALL ? posts : posts.filter((post) => post.dataType === topic);

  const count = filtered.length;

  const selectTopic = (key: string) => {
    posthog.capture("blog_category_tab_changed", { category: key });
    setTopic(key);
  };

  return (
    <section className="flex flex-col gap-7">
      <div className="flex flex-wrap items-center gap-5">
        <Typography.Heading level={2}>
          {query ? `Results for “${query}”` : "All posts"}
        </Typography.Heading>
        <span className="font-semibold text-base text-muted">
          {count} {count === 1 ? "post" : "posts"}
        </span>

        {query ? null : (
          <fieldset className="flex flex-wrap gap-2 sm:ml-auto">
            <legend className="sr-only">Filter posts by topic</legend>
            {[ALL, ...categories].map((key) => {
              const active = key === topic;

              return (
                <button
                  aria-pressed={active}
                  className={cn(
                    "cursor-pointer whitespace-nowrap rounded-full px-5 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-accent font-bold text-accent-foreground"
                      : "bg-surface font-semibold text-muted shadow-surface hover:text-foreground",
                  )}
                  key={key}
                  onClick={() => selectTopic(key)}
                  type="button"
                >
                  {labels[key] ?? key}
                </button>
              );
            })}
          </fieldset>
        )}
      </div>

      {count > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <Typography.Paragraph className="font-semibold" color="muted">
          {query
            ? `No posts match “${query}”.`
            : "No posts under this topic yet."}
        </Typography.Paragraph>
      )}
    </section>
  );
}
