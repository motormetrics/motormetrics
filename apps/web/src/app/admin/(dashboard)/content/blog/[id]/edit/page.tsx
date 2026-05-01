import { getPostById } from "@web/app/admin/actions/blog";
import { BlogPostForm } from "@web/app/admin/components/blog-post-form";
import { PenLine } from "lucide-react";
import { notFound } from "next/navigation";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 font-bold text-3xl tracking-tight">
          <PenLine className="size-8" />
          Edit Blog Post
        </h1>
        <p className="text-default-500">
          Update the content and settings for this blog post.
        </p>
      </div>

      <BlogPostForm mode="edit" defaultValues={post} />
    </div>
  );
}
