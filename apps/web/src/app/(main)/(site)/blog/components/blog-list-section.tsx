import { BlogList } from "@web/app/(main)/(site)/blog/components/blog-list";
import { ListSkeleton } from "@web/components/shared/skeleton";
import { getAllPosts, searchPosts } from "@web/queries/posts";
import { Suspense } from "react";

interface BlogListSectionProps {
  query: string;
}

async function BlogListContent({ query }: BlogListSectionProps) {
  if (query) {
    // Search results hide the topic pills, so no categories are needed.
    return (
      <BlogList
        categories={[]}
        posts={await searchPosts(query)}
        query={query}
      />
    );
  }

  const posts = await getAllPosts();

  // Read from every published post, featured one included, so its topic
  // still gets a tab.
  const categories = [
    ...new Set(posts.flatMap((post) => (post.dataType ? [post.dataType] : []))),
  ].sort((a, b) => a.localeCompare(b));

  // The newest post is the featured card above, so "All" starts at the
  // second; the comp still lists it under its own topic.
  return (
    <BlogList
      categories={categories}
      featuredId={posts[0]?.id}
      posts={posts}
      query={query}
    />
  );
}

export function BlogListSection({ query }: BlogListSectionProps) {
  return (
    <Suspense key={query} fallback={<ListSkeleton count={6} />}>
      <BlogListContent query={query} />
    </Suspense>
  );
}
