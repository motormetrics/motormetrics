"use client";

import { Link } from "@heroui/link";
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

const formatViewCount = (count: number): string => {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(count);
};

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
        <span className="font-semibold text-default-500 text-xs uppercase tracking-widest">
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
              className="group flex h-full items-center gap-4 overflow-hidden rounded-xl border border-default-200 bg-default-50 p-4 transition-all duration-300 hover:border-default-300 hover:shadow-lg"
            >
              {/* Rank */}
              <span className="shrink-0 font-black text-2xl text-primary/20">
                {String(index + 1).padStart(2, "0")}
              </span>

              {/* Content */}
              <div className="flex flex-1 flex-col gap-2">
                <span className="line-clamp-2 font-medium text-default-800 text-sm leading-snug transition-colors group-hover:text-primary">
                  {post.title}
                </span>
                <div className="flex items-center gap-2 text-default-400">
                  <TrendingUp className="size-3 text-orange-500" />
                  <span className="text-xs tabular-nums">
                    {formatViewCount(post.viewCount)} views
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
