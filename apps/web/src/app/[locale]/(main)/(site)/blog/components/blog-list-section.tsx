import { BlogList } from "@web/app/[locale]/(main)/(site)/blog/components/blog-list";
import { ListSkeleton } from "@web/components/shared/skeleton";
import { getAllPosts, searchPosts } from "@web/queries/posts";
import { Suspense } from "react";

interface BlogListSectionProps {
  query: string;
}

function fetchPosts(query: string) {
  if (query) {
    return searchPosts(query);
  }

  return getAllPosts();
}

async function BlogListContent({ query }: BlogListSectionProps) {
  const posts = await fetchPosts(query);

  return <BlogList posts={posts} query={query} />;
}

function BlogListSkeleton() {
  return <ListSkeleton count={3} />;
}

export function BlogListSection({ query }: BlogListSectionProps) {
  return (
    <Suspense key={query} fallback={<BlogListSkeleton />}>
      <BlogListContent query={query} />
    </Suspense>
  );
}
