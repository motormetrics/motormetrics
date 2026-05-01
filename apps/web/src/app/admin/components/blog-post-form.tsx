"use client";

import {
  AlertDialog,
  Button,
  Card,
  Input,
  Label,
  ListBox,
  Select,
  TextArea,
  TextField,
} from "@heroui/react";
import type { SelectPost } from "@motormetrics/database";
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
          <Card.Header>
            <div className="flex items-center gap-2">
              <RefreshCw className="size-5 text-muted-foreground" />
              <div className="flex flex-col gap-1">
                <Card.Title>AI Regeneration</Card.Title>
                <Card.Description>
                  Fetch fresh data for{" "}
                  <strong>
                    {defaultValues.month} ({defaultValues.dataType})
                  </strong>{" "}
                  and regenerate content using AI. The existing post will be
                  replaced.
                </Card.Description>
              </div>
            </div>
          </Card.Header>
          <Card.Content>
            <AlertDialog>
              <Button
                type="button"
                variant="outline"
                isDisabled={isRegenerating}
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
              <AlertDialog.Backdrop>
                <AlertDialog.Container>
                  <AlertDialog.Dialog className="sm:max-w-[440px]">
                    <AlertDialog.CloseTrigger />
                    <AlertDialog.Header>
                      <AlertDialog.Icon status="warning" />
                      <AlertDialog.Heading>
                        Regenerate Blog Post?
                      </AlertDialog.Heading>
                    </AlertDialog.Header>
                    <AlertDialog.Body>
                      This will fetch fresh data for{" "}
                      <strong>
                        {defaultValues.month} ({defaultValues.dataType})
                      </strong>{" "}
                      and generate new content using AI. The current content
                      will be replaced.
                    </AlertDialog.Body>
                    <AlertDialog.Footer>
                      <Button slot="close" variant="tertiary">
                        Cancel
                      </Button>
                      <Button slot="close" onPress={handleRegenerate}>
                        Regenerate
                      </Button>
                    </AlertDialog.Footer>
                  </AlertDialog.Dialog>
                </AlertDialog.Container>
              </AlertDialog.Backdrop>
            </AlertDialog>
          </Card.Content>
        </Card>
      )}

      <Card>
        <Card.Header>
          <Card.Title>Post Details</Card.Title>
          <Card.Description>
            Basic information about the blog post
          </Card.Description>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <TextField isRequired className="flex flex-col gap-2">
            <Label>Title</Label>
            <Input
              name="title"
              placeholder="Enter post title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </TextField>

          <TextField className="flex flex-col gap-2">
            <Label>Excerpt</Label>
            <Input
              name="excerpt"
              placeholder="Short summary for meta description"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </TextField>

          <TextField isRequired className="flex flex-col gap-2">
            <Label>Content</Label>
            <TextArea
              name="content"
              placeholder="Markdown content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={16}
            />
          </TextField>

          <TextField className="flex flex-col gap-2">
            <Label>Tags</Label>
            <Input
              name="tags"
              placeholder="Comma-separated tags (e.g. Cars, Monthly Update)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </TextField>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title>Metadata</Card.Title>
          <Card.Description>
            Optional data source and publication settings
          </Card.Description>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <TextField className="flex flex-col gap-2">
              <Label>Month</Label>
              <Input
                name="month"
                placeholder="YYYY-MM"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
              />
            </TextField>
            <TextField className="flex flex-col gap-2">
              <Label>Data Type</Label>
              <Input
                name="dataType"
                placeholder="e.g. cars, coe, parf"
                value={dataType}
                onChange={(e) => setDataType(e.target.value)}
              />
            </TextField>
          </div>

          <Select
            value={status}
            onChange={(v) => setStatus(v as "draft" | "published")}
          >
            <Label>Status</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="draft" textValue="Draft">
                  Draft
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                <ListBox.Item id="published" textValue="Published">
                  Published
                  <ListBox.ItemIndicator />
                </ListBox.Item>
              </ListBox>
            </Select.Popover>
          </Select>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <Card.Title>Highlights</Card.Title>
              <Card.Description>
                Key statistics displayed on the blog post
              </Card.Description>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onPress={addHighlight}
            >
              <Plus className="mr-1 size-4" />
              Add
            </Button>
          </div>
        </Card.Header>
        {highlights.length > 0 && (
          <Card.Content className="flex flex-col gap-4">
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
                    onPress={() => removeHighlight(highlight.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    name={`highlight-${highlight.id}-value`}
                    placeholder="Value (e.g. 52.6%)"
                    value={highlight.value}
                    onChange={(e) =>
                      updateHighlight(highlight.id, "value", e.target.value)
                    }
                  />
                  <Input
                    name={`highlight-${highlight.id}-label`}
                    placeholder="Label"
                    value={highlight.label}
                    onChange={(e) =>
                      updateHighlight(highlight.id, "label", e.target.value)
                    }
                  />
                  <Input
                    name={`highlight-${highlight.id}-detail`}
                    placeholder="Detail"
                    value={highlight.detail}
                    onChange={(e) =>
                      updateHighlight(highlight.id, "detail", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </Card.Content>
        )}
      </Card>

      <div className="flex justify-end">
        <Button type="submit" isDisabled={isSubmitting}>
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
