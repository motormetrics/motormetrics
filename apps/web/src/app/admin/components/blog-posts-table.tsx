"use client";

import {
  AlertDialog,
  Button,
  Card,
  Chip,
  Dropdown,
  Input,
  Label,
  ListBox,
  Modal,
  Select,
  Table,
  TextField,
} from "@heroui/react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  deleteBlogPost,
  getAllPosts,
  type PostWithMetadata,
  regeneratePost,
} from "@web/app/admin/actions/blog";
import { regeneratePostHero } from "@web/app/admin/actions/regenerate-hero";
import { estimateTokenCost } from "@web/app/admin/lib/token-cost";
import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  Eye,
  ImageIcon,
  Loader2,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

interface BlogPostsTableProps {
  initialPosts: PostWithMetadata[];
  previews: Record<string, ReactNode>;
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-SG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTokens(post: PostWithMetadata): string {
  const totalTokens = post.metadata?.usage?.totalTokens;
  if (!totalTokens) return "N/A";
  const input = post.metadata?.usage?.inputTokens ?? 0;
  const output = post.metadata?.usage?.outputTokens ?? 0;
  return `${totalTokens.toLocaleString()} (${input.toLocaleString()} + ${output.toLocaleString()})`;
}

function SortableHeader({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Button variant="ghost" size="sm" className="-ml-3 h-8" onPress={onPress}>
      {label}
      <ArrowUpDown className="ml-2 size-4" />
    </Button>
  );
}

export function BlogPostsTable({
  initialPosts,
  previews,
}: BlogPostsTableProps) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "createdAt", desc: true },
  ]);
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);
  const [heroRegeneratingId, setHeroRegeneratingId] = useState<string | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "regenerate" | "delete";
    post: PostWithMetadata | null;
  }>({ open: false, type: "regenerate", post: null });
  const [previewDialog, setPreviewDialog] = useState<{
    open: boolean;
    post: PostWithMetadata | null;
  }>({ open: false, post: null });

  const handleRegenerate = async (post: PostWithMetadata) => {
    setRegeneratingId(post.id);
    setConfirmDialog({ open: false, type: "regenerate", post: null });
    try {
      const result = await regeneratePost({
        month: post.month,
        dataType: post.dataType as "cars" | "coe",
      });
      if (result.success) {
        toast.success(
          `Blog post for ${post.month} (${post.dataType}) regenerated successfully!`,
        );
        const allPosts = await getAllPosts();
        setPosts(allPosts);
      } else {
        throw new Error(result.error ?? "Unknown error");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to regenerate blog post.",
      );
    } finally {
      setRegeneratingId(null);
    }
  };

  const handleRegenerateHero = useCallback(async (post: PostWithMetadata) => {
    setHeroRegeneratingId(post.id);
    try {
      const result = await regeneratePostHero(post.id);
      if (result.success) {
        toast.success(
          `Hero image regeneration started for "${post.title}". Refresh in a moment to see the new image.`,
        );
      } else {
        throw new Error(result.error ?? "Unknown error");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to regenerate hero image.",
      );
    } finally {
      setHeroRegeneratingId(null);
    }
  }, []);

  const handleDelete = async (post: PostWithMetadata) => {
    setDeletingId(post.id);
    setConfirmDialog({ open: false, type: "delete", post: null });
    try {
      const result = await deleteBlogPost(post.id);
      if (result.success) {
        toast.success(`"${post.title}" deleted successfully.`);
        setPosts((prev) => prev.filter((p) => p.id !== post.id));
      } else {
        throw new Error(result.error ?? "Unknown error");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete blog post.",
      );
    } finally {
      setDeletingId(null);
    }
  };

  const handlePreview = useCallback((post: PostWithMetadata) => {
    setPreviewDialog({ open: true, post });
  }, []);

  const columns = useMemo<ColumnDef<PostWithMetadata>[]>(
    () => [
      {
        accessorKey: "title",
        header: ({ column }) => (
          <SortableHeader
            label="Title"
            onPress={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <Link
            href={`/admin/content/blog/${row.original.id}/edit`}
            className="line-clamp-1 font-medium hover:underline"
          >
            {row.original.title}
          </Link>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Chip
            color={row.original.status === "published" ? "success" : "default"}
            variant={
              row.original.status === "published" ? "primary" : "secondary"
            }
          >
            {row.original.status ?? "draft"}
          </Chip>
        ),
      },
      {
        accessorKey: "month",
        header: ({ column }) => (
          <SortableHeader
            label="Month"
            onPress={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => row.original.month ?? "N/A",
      },
      {
        accessorKey: "dataType",
        header: "Type",
        cell: ({ row }) => (
          <Chip variant="secondary">
            {row.original.dataType?.toUpperCase() ?? "N/A"}
          </Chip>
        ),
      },
      {
        id: "model",
        header: "Model",
        cell: ({ row }) => (
          <span className="text-muted text-sm">
            {row.original.metadata?.modelId || "N/A"}
          </span>
        ),
      },
      {
        id: "tokens",
        accessorFn: (row) => row.metadata?.usage?.totalTokens ?? 0,
        header: ({ column }) => (
          <SortableHeader
            label="Tokens"
            onPress={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="text-muted text-sm">
            {formatTokens(row.original)}
          </span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <SortableHeader
            label="Created"
            onPress={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="text-muted text-sm">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const post = row.original;
          const isLoading =
            regeneratingId === post.id ||
            heroRegeneratingId === post.id ||
            deletingId === post.id;

          if (isLoading) {
            return <Loader2 className="size-4 animate-spin text-muted" />;
          }

          return (
            <Dropdown>
              <Button
                isIconOnly
                aria-label="Open menu"
                variant="ghost"
                size="sm"
                className="size-8 p-0"
              >
                <MoreHorizontal className="size-4" />
                <span className="sr-only">Open menu</span>
              </Button>
              <Dropdown.Popover placement="bottom end">
                <Dropdown.Menu
                  onAction={(key) => {
                    if (key === "view") {
                      window.open(
                        `/blog/${post.slug}`,
                        "_blank",
                        "noopener,noreferrer",
                      );
                    }
                    if (key === "edit") {
                      router.push(`/admin/content/blog/${post.id}/edit`);
                    }
                    if (key === "preview") {
                      handlePreview(post);
                    }
                    if (key === "regenerate") {
                      setConfirmDialog({
                        open: true,
                        type: "regenerate",
                        post,
                      });
                    }
                    if (key === "regenerate-hero") {
                      handleRegenerateHero(post);
                    }
                    if (key === "delete") {
                      setConfirmDialog({ open: true, type: "delete", post });
                    }
                  }}
                >
                  <Dropdown.Item id="view" textValue="View">
                    <ExternalLink className="mr-2 size-4" />
                    <Label>View</Label>
                  </Dropdown.Item>
                  <Dropdown.Item id="edit" textValue="Edit">
                    <Pencil className="mr-2 size-4" />
                    <Label>Edit</Label>
                  </Dropdown.Item>
                  <Dropdown.Item id="preview" textValue="Preview">
                    <Eye className="mr-2 size-4" />
                    <Label>Preview</Label>
                  </Dropdown.Item>
                  {post.month && post.dataType && (
                    <>
                      <Dropdown.Item id="regenerate" textValue="Regenerate">
                        <RefreshCw className="mr-2 size-4" />
                        <Label>Regenerate</Label>
                      </Dropdown.Item>
                      <Dropdown.Item
                        id="regenerate-hero"
                        textValue="Regenerate Hero"
                      >
                        <ImageIcon className="mr-2 size-4" />
                        <Label>Regenerate Hero</Label>
                      </Dropdown.Item>
                    </>
                  )}
                  <Dropdown.Item
                    id="delete"
                    textValue="Delete"
                    variant="danger"
                  >
                    <Trash2 className="mr-2 size-4" />
                    <Label>Delete</Label>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          );
        },
      },
    ],
    [
      regeneratingId,
      heroRegeneratingId,
      deletingId,
      handlePreview,
      handleRegenerateHero,
      router,
    ],
  );

  const table = useReactTable({
    data: posts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = String(filterValue).toLowerCase();
      const title = row.original.title?.toLowerCase() ?? "";
      const month = row.original.month?.toLowerCase() ?? "";
      const dataType = row.original.dataType?.toLowerCase() ?? "";
      return (
        title.includes(search) ||
        month.includes(search) ||
        dataType.includes(search)
      );
    },
    state: { sorting, globalFilter },
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <>
      <Card>
        <Card.Header>
          <Card.Title>All Blog Posts</Card.Title>
          <Card.Description>
            {table.getFilteredRowModel().rows.length} of {posts.length} post
            {posts.length !== 1 ? "s" : ""}
          </Card.Description>
        </Card.Header>
        <Card.Content className="flex flex-col gap-4">
          {/* Search */}
          <TextField
            aria-label="Search blog posts"
            className="relative max-w-sm"
          >
            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
            <Input
              placeholder="Search by title, month, or type..."
              value={globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value);
                table.setPageIndex(0);
              }}
              className="pl-9"
            />
          </TextField>

          {/* Table */}
          <Table>
            <Table.ScrollContainer>
              <Table.Content aria-label="Blog posts" className="min-w-[900px]">
                <Table.Header>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <Table.Row key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <Table.Column
                          key={header.id}
                          id={header.id}
                          isRowHeader={header.id === "title"}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </Table.Column>
                      ))}
                    </Table.Row>
                  ))}
                </Table.Header>
                <Table.Body>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <Table.Row key={row.id} id={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <Table.Cell key={cell.id}>
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </Table.Cell>
                        ))}
                      </Table.Row>
                    ))
                  ) : (
                    <Table.Row>
                      <Table.Cell className="h-24 text-center text-muted">
                        No blog posts found.
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>

          {/* Pagination */}
          <div className="flex flex-col items-center gap-2 lg:flex-row lg:justify-between">
            <p className="text-muted text-sm">
              {table.getFilteredRowModel().rows.length} row
              {table.getFilteredRowModel().rows.length !== 1 ? "s" : ""}
            </p>
            <div className="flex flex-col items-center gap-4 lg:flex-row lg:gap-6">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">Rows per page</span>
                <Select
                  value={`${table.getState().pagination.pageSize}`}
                  onChange={(value) => table.setPageSize(Number(value))}
                  aria-label="Rows per page"
                >
                  <Select.Trigger className="h-8 w-[70px]">
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover placement="top">
                    <ListBox>
                      {[10, 20, 30, 50].map((size) => (
                        <ListBox.Item
                          key={size}
                          id={`${size}`}
                          textValue={`${size}`}
                        >
                          {size}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
              </div>
              <span className="font-medium text-sm">
                Page {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden size-8 p-0 lg:flex"
                  onPress={() => table.setPageIndex(0)}
                  isDisabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">First page</span>
                  <ChevronsLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="size-8 p-0"
                  onPress={() => table.previousPage()}
                  isDisabled={!table.getCanPreviousPage()}
                >
                  <span className="sr-only">Previous page</span>
                  <ChevronLeft className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="size-8 p-0"
                  onPress={() => table.nextPage()}
                  isDisabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Next page</span>
                  <ChevronRight className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden size-8 p-0 lg:flex"
                  onPress={() => table.setPageIndex(table.getPageCount() - 1)}
                  isDisabled={!table.getCanNextPage()}
                >
                  <span className="sr-only">Last page</span>
                  <ChevronsRight className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Confirm Dialog */}
      <AlertDialog.Backdrop
        isOpen={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
      >
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-[480px]">
            <AlertDialog.CloseTrigger />
            <AlertDialog.Header>
              <AlertDialog.Icon
                status={confirmDialog.type === "delete" ? "danger" : "warning"}
              />
              <AlertDialog.Heading>
                {confirmDialog.type === "delete"
                  ? "Delete Blog Post?"
                  : "Regenerate Blog Post?"}
              </AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <div className="flex flex-col gap-3">
                {confirmDialog.type === "delete" ? (
                  <p>
                    This will permanently delete{" "}
                    <strong>"{confirmDialog.post?.title}"</strong>. This action
                    cannot be undone.
                  </p>
                ) : (
                  <>
                    <p>
                      This will generate a new blog post for{" "}
                      <strong>
                        {confirmDialog.post?.month} (
                        {confirmDialog.post?.dataType})
                      </strong>{" "}
                      using the latest data and AI model. The existing post will
                      be updated.
                    </p>
                    {confirmDialog.post?.metadata?.usage && (
                      <div className="flex flex-col gap-1 rounded-md bg-surface p-3 text-sm">
                        <span className="font-medium">
                          Estimated regeneration cost:
                        </span>
                        <span>
                          Previous usage:{" "}
                          {confirmDialog.post.metadata.usage.totalTokens?.toLocaleString()}{" "}
                          tokens
                        </span>
                        <span>
                          Estimated cost: ~
                          {estimateTokenCost(confirmDialog.post.metadata.usage)}
                        </span>
                        <span className="text-muted text-xs">
                          Based on Gemini Flash pricing. Actual cost may vary.
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button slot="close" variant="tertiary">
                Cancel
              </Button>
              <Button
                slot="close"
                variant={confirmDialog.type === "delete" ? "danger" : "primary"}
                onPress={() => {
                  if (!confirmDialog.post) return;
                  if (confirmDialog.type === "delete") {
                    handleDelete(confirmDialog.post);
                  } else {
                    handleRegenerate(confirmDialog.post);
                  }
                }}
              >
                {confirmDialog.type === "delete" ? "Delete" : "Regenerate"}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>

      {/* Content Preview Modal */}
      <Modal.Backdrop
        isOpen={previewDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setPreviewDialog({ open: false, post: null });
          }
        }}
      >
        <Modal.Container size="cover" scroll="inside">
          <Modal.Dialog>
            <Modal.CloseTrigger />
            <Modal.Header>
              <Modal.Heading className="line-clamp-2">
                {previewDialog.post?.title}
              </Modal.Heading>
            </Modal.Header>
            <Modal.Body>
              {previewDialog.post && previews[previewDialog.post.id]}
            </Modal.Body>
            <Modal.Footer>
              {previewDialog.post?.slug && (
                <Link
                  href={`/blog/${previewDialog.post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline">
                    <ExternalLink className="mr-2 size-4" />
                    View Live
                  </Button>
                </Link>
              )}
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </>
  );
}
