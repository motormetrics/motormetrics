"use client";

import { Tabs } from "@heroui/react";

import type { SelectPost } from "@motormetrics/database";
import { Post } from "@web/app/(main)/(site)/blog/components/post";
import {
  staggerContainerVariants,
  staggerItemVariants,
} from "@web/config/animations";
import { motion } from "framer-motion";
import posthog from "posthog-js";
import { useMemo, useState } from "react";

interface PostCounts {
  total: number;
  category: Record<string, number>;
}

interface BlogListClientProps {
  posts: SelectPost[];
  counts: PostCounts;
  query: string;
}

interface PostsGridProps {
  posts: SelectPost[];
}

const tabLabels: Record<string, string> = {
  all: "All Posts",
  coe: "COE",
  cars: "Cars",
};

const PostsGrid = ({ posts }: PostsGridProps) => {
  return (
    <motion.div
      className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {posts.map((post) => (
        <motion.div key={post.id} variants={staggerItemVariants}>
          <Post.Card post={post} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export function BlogListClient({ posts, counts, query }: BlogListClientProps) {
  const [selectedTab, setSelectedTab] = useState("all");

  const filteredPosts = useMemo(() => {
    if (selectedTab === "all") {
      return posts;
    }
    return posts.filter((post) => post.dataType === selectedTab);
  }, [posts, selectedTab]);

  const heroPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

  if (posts.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted">
          {query
            ? `No results found for "${query}".`
            : "No blog posts available."}
        </p>
      </div>
    );
  }

  if (query) {
    return (
      <div className="flex flex-col gap-8">
        <p className="text-default-600">
          {filteredPosts.length} result{filteredPosts.length !== 1 && "s"} for "
          {query}"
        </p>
        <PostsGrid posts={filteredPosts} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Tabs
        selectedKey={selectedTab}
        variant="secondary"
        onSelectionChange={(key) => {
          posthog.capture("blog_category_tab_changed", {
            category: key as string,
          });
          setSelectedTab(key as string);
        }}
      >
        <Tabs.ListContainer>
          <Tabs.List
            aria-label="Blog categories"
            className="gap-6 *:h-10 *:px-0"
          >
            <Tabs.Tab id="all">
              {tabLabels.all} ({counts.total})
              <Tabs.Indicator />
            </Tabs.Tab>
            {Object.keys(counts.category)
              .sort((a, b) => a.localeCompare(b))
              .map((cat) => (
                <Tabs.Tab key={cat} id={cat}>
                  {tabLabels[cat] || cat} ({counts.category[cat]})
                  <Tabs.Indicator />
                </Tabs.Tab>
              ))}
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>

      {heroPost && (
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={staggerItemVariants}>
            <Post.Hero post={heroPost} />
          </motion.div>
        </motion.div>
      )}

      {remainingPosts.length > 0 && <PostsGrid posts={remainingPosts} />}
    </div>
  );
}
