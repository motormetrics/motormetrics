"use client";

import type { SelectPost } from "@motormetrics/database";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@motormetrics/ui/components/alert-dialog";
import { Button } from "@motormetrics/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@motormetrics/ui/components/card";
import { Input } from "@motormetrics/ui/components/input";
import { Label } from "@motormetrics/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@motormetrics/ui/components/select";
import { Textarea } from "@motormetrics/ui/components/textarea";
import {
  createBlogPost,
  regeneratePost,
  updateBlogPost,
} from "@web/app/admin/actions/blog";
import type { CreatePostInput } from "@web/app/admin/lib/create-post";
import type { UpdatePostInput } from "@web/app/admin/lib/update-post";
import { Loader2, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface Highlight {
  id: string;
  value: string;
  label: string;
  detail: string;
}

interface BlogPostFormProps {
  mode: "create" | "edit";
  defaultValues?: SelectPost;
}

export function BlogPostForm({ mode, defaultValues }: BlogPostFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [content, setContent] = useState(defaultValues?.content ?? "");
  const [excerpt, setExcerpt] = useState(defaultValues?.excerpt ?? "");
  const [tags, setTags] = useState(defaultValues?.tags?.join(", ") ?? "");
  const [month, setMonth] = useState(defaultValues?.month ?? "");
  const [dataType, setDataType] = useState(defaultValues?.dataType ?? "");
  const [status, setStatus] = useState<"draft" | "published">(
    (defaultValues?.status as "draft" | "published") ?? "draft",
  );
  const [highlights, setHighlights] = useState<Highlight[]>(() => {
    if (!defaultValues?.highlights) return [];
    const raw = defaultValues.highlights as Array<{
      value: string;
      label: string;
      detail: string;
    }>;
    return raw.map((h) => ({ ...h, id: crypto.randomUUID() }));
  });

  const canRegenerate =
    mode === "edit" && defaultValues?.month && defaultValues?.dataType;

  const addHighlight = () => {
    setHighlights([
      ...highlights,
      { id: crypto.randomUUID(), value: "", label: "", detail: "" },
    ]);
  };

  const removeHighlight = (highlightId: string) => {
    setHighlights(
      highlights.filter((highlight) => highlight.id !== highlightId),
    );
  };

  const updateHighlight = (
    highlightId: string,
    field: "value" | "label" | "detail",
    fieldValue: string,
  ) => {
    setHighlights(
      highlights.map((highlight) =>
        highlight.id === highlightId
          ? { ...highlight, [field]: fieldValue }
          : highlight,
      ),
    );
  };

  const handleRegenerate = async () => {
    if (!defaultValues?.month || !defaultValues?.dataType) return;

    setIsRegenerating(true);

    try {
      const result = await regeneratePost({
        month: defaultValues.month,
        dataType: defaultValues.dataType as "cars" | "coe",
      });

      if (result.success) {
        toast.success("Post regenerated successfully. Refreshing...");
        router.refresh();
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to regenerate blog post.",
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const parsedTags = tags
      ? tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : undefined;

    const parsedHighlights =
      highlights.length > 0
        ? highlights.map(({ value, label, detail }) => ({
            value,
            label,
            detail,
          }))
        : undefined;

    try {
      if (mode === "edit" && defaultValues) {
        const input: UpdatePostInput = {
          id: defaultValues.id,
          title,
          content,
          status,
          ...(excerpt && { excerpt }),
          ...(parsedTags && { tags: parsedTags }),
          ...(month && { month }),
          ...(dataType && { dataType }),
          ...(parsedHighlights && { highlights: parsedHighlights }),
        };

        const result = await updateBlogPost(input);

        if (result.success) {
          toast.success("Blog post updated successfully");
          router.push("/admin/content/blog");
        } else {
          toast.error(result.error ?? "Failed to update blog post");
        }
      } else {
        const input: CreatePostInput = {
          title,
          content,
          status,
          ...(excerpt && { excerpt }),
          ...(parsedTags && { tags: parsedTags }),
          ...(month && { month }),
          ...(dataType && { dataType }),
          ...(parsedHighlights && { highlights: parsedHighlights }),
        };

        const result = await createBlogPost(input);

        if (result.success) {
          toast.success("Blog post created successfully");
          router.push("/admin/content/blog");
        } else {
          toast.error(result.error ?? "Failed to create blog post");
        }
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {canRegenerate && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <RefreshCw className="size-5 text-muted-foreground" />
              <div className="flex flex-col gap-1">
                <CardTitle>AI Regeneration</CardTitle>
                <CardDescription>
                  Fetch fresh data for{" "}
                  <strong>
                    {defaultValues.month} ({defaultValues.dataType})
                  </strong>{" "}
                  and regenerate content using AI. The existing post will be
                  replaced.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isRegenerating}
                >
                  {isRegenerating ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 size-4" />
                      Regenerate Content
                    </>
                  )}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Regenerate Blog Post?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will fetch fresh data for{" "}
                    <strong>
                      {defaultValues.month} ({defaultValues.dataType})
                    </strong>{" "}
                    and generate new content using AI. The current content will
                    be replaced.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRegenerate}>
                    Regenerate
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Post Details</CardTitle>
          <CardDescription>
            Basic information about the blog post
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Input
              id="excerpt"
              placeholder="Short summary for meta description"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="Markdown content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              placeholder="Comma-separated tags (e.g. Cars, Monthly Update)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
          <CardDescription>
            Optional data source and publication settings
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="month">Month</Label>
              <Input
                id="month"
                placeholder="YYYY-MM"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="dataType">Data Type</Label>
              <Input
                id="dataType"
                placeholder="e.g. cars, coe, parf"
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as "draft" | "published")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <CardTitle>Highlights</CardTitle>
              <CardDescription>
                Key statistics displayed on the blog post
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addHighlight}
            >
              <Plus className="mr-1 size-4" />
              Add
            </Button>
          </div>
        </CardHeader>
        {highlights.length > 0 && (
          <CardContent className="flex flex-col gap-4">
            {highlights.map((highlight, index) => (
              <div
                key={highlight.id}
                className="flex flex-col gap-2 rounded-md border p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">
                    Highlight {index + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeHighlight(highlight.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    placeholder="Value (e.g. 52.6%)"
                    value={highlight.value}
                    onChange={(e) =>
                      updateHighlight(highlight.id, "value", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Label"
                    value={highlight.label}
                    onChange={(e) =>
                      updateHighlight(highlight.id, "label", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Detail"
                    value={highlight.detail}
                    onChange={(e) =>
                      updateHighlight(highlight.id, "detail", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </CardContent>
        )}
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Save className="mr-2 size-4" />
          )}
          {isSubmitting
            ? mode === "edit"
              ? "Updating..."
              : "Creating..."
            : mode === "edit"
              ? "Update Post"
              : "Create Post"}
        </Button>
      </div>
    </form>
  );
}
