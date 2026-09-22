import { BlogList } from "@web/app/(main)/(site)/blog/components/blog-list";
import { GridSkeleton } from "@web/components/shared/skeleton";
import { getAllPosts, searchPosts } from "@web/queries/posts";
import { Suspense } from "react";

interface BlogListSectionProps {
  query: string;
}

async function BlogListContent({ query }: BlogListSectionProps) {
  if (query) {
    return <BlogList posts={await searchPosts(query)} query={query} />;
  }

  // The newest post is the featured panel above, so the grid starts at the
  // second — the comp never shows the same post twice on the page.
  const posts = await getAllPosts();

  return <BlogList posts={posts.slice(1)} query={query} />;
}

export function BlogListSection({ query }: BlogListSectionProps) {
  return (
    <Suspense
      key={query}
      fallback={
        <GridSkeleton
          columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          count={6}
        />
      }
    >
      <BlogListContent query={query} />
    </Suspense>
  );
}
