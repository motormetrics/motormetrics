"use client";

import { Link } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";

import type { SelectPost } from "@motormetrics/database";
import { Flame, TrendingUp } from "lucide-react";

interface PostWithViews extends SelectPost {
  viewCount: number;
}

interface PopularPostsProps {
  posts: PostWithViews[];
}

export function PopularPosts({ posts }: PopularPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Flame className="size-4 text-warning" />
        <span className="font-medium text-foreground text-sm">Trending</span>
      </div>

      {/* Posts Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
        {posts.map((post, index) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group flex h-full items-center gap-4 overflow-hidden rounded-xl bg-default p-4 hover:bg-default/80"
          >
            {/* Rank */}
            <span className="shrink-0 font-semibold text-lg text-muted tabular-nums">
              {index + 1}
            </span>

            {/* Content */}
            <div className="flex flex-1 flex-col gap-2">
              <span className="line-clamp-2 font-medium text-foreground text-sm leading-snug transition-colors group-hover:text-accent">
                {post.title}
              </span>
              <div className="flex items-center gap-2 text-muted">
                <TrendingUp className="size-3 text-accent" />
                <span className="text-xs tabular-nums">
                  <NumberValue
                    maximumFractionDigits={1}
                    notation="compact"
                    value={post.viewCount}
                  >
                    <NumberValue.Suffix> views</NumberValue.Suffix>
                  </NumberValue>
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
