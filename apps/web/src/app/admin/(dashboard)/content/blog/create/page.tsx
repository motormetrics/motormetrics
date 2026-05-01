import { BlogPostForm } from "@web/app/admin/components/blog-post-form";
import { PenLine } from "lucide-react";

export default function CreatePostPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="flex items-center gap-2 font-bold text-3xl tracking-tight">
          <PenLine className="size-8" />
          Create Blog Post
        </h1>
        <p className="text-muted">
          Manually create a new blog post with custom content.
        </p>
      </div>

      <BlogPostForm mode="create" />
    </div>
  );
}
