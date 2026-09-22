import type { SelectPost } from "@motormetrics/database/schema";
import { getPostCountsByCategory } from "@web/queries/posts";
import { BlogListClient } from "./client";

interface BlogListProps {
  posts: SelectPost[];
  query: string;
}

export async function BlogList({ posts, query }: BlogListProps) {
  const postCounts = await getPostCountsByCategory();

  const categories = postCounts
    .filter((row) => row.category)
    .map((row) => row.category as string)
    .sort((a, b) => a.localeCompare(b));

  return <BlogListClient categories={categories} posts={posts} query={query} />;
}
