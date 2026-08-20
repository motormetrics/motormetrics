import { BlogList } from "@web/app/(main)/(site)/blog/components/blog-list";
import { BonesFallback } from "@web/components/shared/bones-fallback";
import { BonesCapture } from "@web/components/shared/bones-skeleton";
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

  return (
    <BonesCapture name="blog-list">
      <BlogList posts={posts} query={query} />
    </BonesCapture>
  );
}

export function BlogListSection({ query }: BlogListSectionProps) {
  return (
    <Suspense key={query} fallback={<BonesFallback name="blog-list" />}>
      <BlogListContent query={query} />
    </Suspense>
  );
}
