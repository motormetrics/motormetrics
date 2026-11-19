import { BlogList } from "@web/app/(main)/(site)/blog/components/blog-list";
import { loadSearchParams } from "@web/app/(main)/(site)/blog/search-params";
import { getAllPosts, searchPosts } from "@web/queries/posts";
import { getPostTrends } from "@web/queries/posts/trends";
import type { SearchParams } from "nuqs/server";

/**
 * The archive's posts, or the results for `?q`. The only part of the index
 * that reads search params, so the only part behind a boundary.
 */
export async function BlogArchive({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q: query } = await loadSearchParams(searchParams);

  if (query) {
    const results = await searchPosts(query);

    // Search results hide the topic tabs, so no categories are needed.
    return (
      <BlogList
        categories={[]}
        posts={results}
        query={query}
        trends={await getPostTrends(results)}
      />
    );
  }

  const posts = await getAllPosts();

  const categories = [
    ...new Set(posts.flatMap((post) => (post.dataType ? [post.dataType] : []))),
  ].sort((a, b) => a.localeCompare(b));

  return (
    <BlogList
      categories={categories}
      posts={posts}
      query={query}
      trends={await getPostTrends(posts)}
    />
  );
}
