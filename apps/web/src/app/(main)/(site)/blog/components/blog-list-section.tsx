import { BlogList } from "@web/app/(main)/(site)/blog/components/blog-list";
import { loadSearchParams } from "@web/app/(main)/(site)/blog/search-params";
import { getAllPosts, searchPosts } from "@web/queries/posts";
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
    // Search results hide the topic tabs, so no categories are needed.
    return (
      <BlogList
        categories={[]}
        posts={await searchPosts(query)}
        query={query}
      />
    );
  }

  const posts = await getAllPosts();

  // Read from every published post, the latest included, so its topic still
  // gets a tab.
  const categories = [
    ...new Set(posts.flatMap((post) => (post.dataType ? [post.dataType] : []))),
  ].sort((a, b) => a.localeCompare(b));

  // The newest post leads the page above, so "All" starts at the second; it
  // is still listed under its own topic.
  return (
    <BlogList
      categories={categories}
      featuredId={posts[0]?.id}
      posts={posts}
      query={query}
    />
  );
}
