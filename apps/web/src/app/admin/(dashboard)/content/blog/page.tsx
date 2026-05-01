import { Button, Card } from "@heroui/react";
import { mdxComponents } from "@web/app/(main)/(site)/blog/components/mdx-components";
import { getAllPosts } from "@web/app/admin/actions/blog";
import { BlogPostsTable } from "@web/app/admin/components/blog-posts-table";
import { ListSkeleton } from "@web/components/shared/skeleton";
import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import type { ReactNode } from "react";
import { Suspense } from "react";
import remarkGfm from "remark-gfm";

export default async function BlogManagementPage() {
  const posts = await getAllPosts();

  const previews: Record<string, ReactNode> = {};
  for (const post of posts) {
    const content = (post as unknown as { content: string }).content;
    if (content) {
      previews[post.id] = (
        <article className="prose max-w-none p-6">
          <MDXRemote
            source={content}
            components={mdxComponents}
            options={{
              mdxOptions: { format: "md", remarkPlugins: [remarkGfm] },
            }}
          />
        </article>
      );
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 font-bold text-3xl tracking-tight">
            <FileText className="size-8" />
            Blog Management
          </h1>
          <p className="text-muted">
            View and regenerate blog posts generated from market data.
          </p>
        </div>
        <Link href="/admin/content/blog/create">
          <Button>
            <Plus className="mr-2 size-4" />
            Create Post
          </Button>
        </Link>
      </div>

      {/* Posts Table */}
      <Suspense fallback={<ListSkeleton count={5} itemHeight="h-16" />}>
        <BlogPostsTable initialPosts={posts} previews={previews} />
      </Suspense>

      {/* Instructions */}
      <Card>
        <Card.Header>
          <Card.Title>Instructions</Card.Title>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4 text-muted text-sm">
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground">🤖</span>
            <span>
              <strong>AI Generation:</strong> Posts are generated using Google
              Gemini 2.5 Flash with market data analysis.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground">🔄</span>
            <span>
              <strong>Regeneration:</strong> Regenerating a post will fetch
              fresh data and create new content, replacing the existing version.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground">💾</span>
            <span>
              <strong>Auto-save:</strong> Regenerated posts are automatically
              saved to the database and published.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-foreground">🚀</span>
            <span>
              <strong>Cache Revalidation:</strong> The web app cache is
              automatically revalidated after regeneration.
            </span>
          </div>
        </Card.Content>
      </Card>
    </div>
  );
}
