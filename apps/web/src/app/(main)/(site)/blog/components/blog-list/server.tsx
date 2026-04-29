import type { SelectPost } from "@motormetrics/database";
import { getPostCountsByCategory } from "@web/queries/posts";
import { BlogListClient } from "./client";

interface BlogListProps {
  posts: SelectPost[];
  query: string;
}

export async function BlogList({ posts, query }: BlogListProps) {
  const postCounts = await getPostCountsByCategory();

  const counts = {
    total: postCounts.reduce((sum, row) => sum + Number(row.count), 0),
    category: Object.fromEntries(
      postCounts
        .filter((row) => row.category)
        .map((row) => [row.category, Number(row.count)]),
    ),
  };

  return <BlogListClient posts={posts} counts={counts} query={query} />;
}
