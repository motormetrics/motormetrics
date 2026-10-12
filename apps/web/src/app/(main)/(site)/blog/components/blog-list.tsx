"use client";

import { Button, Typography } from "@heroui/react";
import { Segment } from "@heroui-pro/react";
import type { SelectPost } from "@motormetrics/database/schema";
import {
  getCategoryConfig,
  getReadingTime,
  POST_CATEGORIES,
} from "@web/app/(main)/(site)/blog/components/post/utils";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { formatDate } from "@web/utils/dates/format-date";
import Link from "next/link";
import posthog from "posthog-js";
import { useState } from "react";

interface BlogListProps {
  /** Every dataType with at least one published post, alphabetical. */
  categories: string[];
  /** The post in the featured card, left out of "All" but kept under its topic. */
  featuredId?: string;
  posts: SelectPost[];
  query: string;
}

const ALL = "all";

/** Rows shown before "Show all", as in the comp. */
const PAGE_SIZE = 12;

// Derived so a new dataType shows a real tab label instead of its raw slug.
const labels: Record<string, string> = {
  [ALL]: "All",
  ...Object.fromEntries(
    Object.entries(POST_CATEGORIES).map(([key, value]) => [key, value.label]),
  ),
};

/**
 * The comp's archive: a ruled list of posts, newest first, with the date, the
 * post and its length in three columns — the date above the post on phones.
 *
 * The topic tabs filter the posts already on the page rather than refetching —
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
  const visible = showAll ? filtered : filtered.slice(0, PAGE_SIZE);

  const count = filtered.length;
  const countLabel = `${topic === ALL ? "" : `${labels[topic] ?? topic} · `}${count} ${count === 1 ? "post" : "posts"}`;

  const selectTopic = (key: string) => {
    posthog.capture("blog_category_tab_changed", { category: key });
    setTopic(key);
    setShowAll(false);
  };

  return (
    <section className="flex flex-col gap-4">
      <SectionHead
        caption={countLabel}
        eyebrow={query ? "Search" : "Archive"}
        title={query ? `Results for “${query}”` : "All posts"}
        trailing={
          query ? null : (
            // Segment does not wrap, so the tabs scroll sideways inside this
            // wrapper on a phone instead of pushing the page wider.
            <div className="max-w-full overflow-x-auto max-md:w-full">
              <Segment
                aria-label="Filter posts by topic"
                className="max-md:w-full"
                onSelectionChange={(key) => selectTopic(String(key))}
                selectedKey={topic}
                size="sm"
                variant="ghost"
              >
                {[ALL, ...categories].map((key) => (
                  <Segment.Item
                    className="max-md:flex-1 max-md:px-2"
                    id={key}
                    key={key}
                  >
                    {labels[key] ?? key}
                  </Segment.Item>
                ))}
              </Segment>
            </div>
          )
        }
      />

      {/* Pulled out by the rows' padding, so the hover fill has room while the text stays on the section's edge. */}
      <div className="-mx-3 flex flex-col">
        <div className="flex gap-6 border-border border-b px-3 pb-2 font-semibold text-muted text-xs max-md:hidden">
          <span className="w-24 shrink-0 lg:w-28">Published</span>
          <span className="min-w-0 flex-1">Post</span>
          <span className="w-24 shrink-0 text-right max-lg:hidden">Length</span>
        </div>

        {visible.map((post) => (
          <Link
            className="group flex flex-col gap-1.5 border-separator border-b px-3 py-3.5 text-foreground no-underline transition-colors hover:bg-surface-secondary md:flex-row md:gap-6 md:py-4"
            href={`/blog/${post.slug}`}
            key={post.id}
          >
            <span className="shrink-0 whitespace-nowrap pt-0.5 text-muted text-sm tabular-nums md:w-24 lg:w-28">
              {formatDate(post.publishedAt ?? post.createdAt)}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Typography.Paragraph
                className="text-accent-strong uppercase"
                size="xs"
                weight="semibold"
              >
                {getCategoryConfig(post).label}
              </Typography.Paragraph>
              <Typography.Heading
                className="max-w-3xl text-lg leading-snug transition-colors group-hover:text-accent-strong md:text-xl"
                level={3}
              >
                {post.title}
              </Typography.Heading>
              {post.excerpt ? (
                <Typography.Paragraph
                  className="max-w-2xl"
                  color="muted"
                  size="sm"
                >
                  {post.excerpt}
                </Typography.Paragraph>
              ) : null}
            </div>
            <span className="w-24 shrink-0 pt-0.5 text-right text-muted text-sm tabular-nums max-lg:hidden">
              {getReadingTime(post)} min read
            </span>
          </Link>
        ))}

        {count === 0 ? (
          <Typography.Paragraph
            className="border-separator border-b px-3 py-4"
            color="muted"
          >
            {query
              ? `No posts match “${query}”.`
              : "No posts under this topic yet."}
          </Typography.Paragraph>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <SourceNote>
          Posts on motormetrics.app/blog, newest first. Source: LTA via
          DataMall.
        </SourceNote>
        {count > PAGE_SIZE ? (
          <Button
            className="sm:ml-auto"
            onPress={() => setShowAll((current) => !current)}
            size="sm"
            variant="outline"
          >
            {showAll ? "Show fewer" : `Show all ${count} posts`}
          </Button>
        ) : null}
      </div>
    </section>
  );
}
