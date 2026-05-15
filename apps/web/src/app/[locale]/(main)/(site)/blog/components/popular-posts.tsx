"use client";

import { Link } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";

import type { SelectPost } from "@motormetrics/database";
import {
  fadeInVariants,
  staggerContainerVariants,
  staggerItemVariants,
} from "@web/config/animations";
import { motion } from "framer-motion";
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
      <motion.div
        variants={fadeInVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center gap-2"
      >
        <Flame className="size-4 text-orange-500" />
        <span className="font-semibold text-muted text-xs uppercase tracking-widest">
          Trending
        </span>
      </motion.div>

      {/* Posts Grid */}
      <motion.div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2"
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {posts.map((post, index) => (
          <motion.div key={post.id} variants={staggerItemVariants}>
            <Link
              href={`/blog/${post.slug}`}
              className="group flex h-full items-center gap-4 overflow-hidden rounded-xl border border-border bg-default p-4 transition-all duration-300 hover:border-border hover:shadow-lg"
            >
              {/* Rank */}
              <span className="shrink-0 font-black text-2xl text-accent/20">
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* Content */}
              <div className="flex flex-1 flex-col gap-2">
                <span className="line-clamp-2 font-medium text-foreground text-sm leading-snug transition-colors group-hover:text-accent">
                  {post.title}
                </span>
                <div className="flex items-center gap-2 text-muted">
                  <TrendingUp className="size-3 text-orange-500" />
                  <span className="text-xs">
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
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
