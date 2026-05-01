import type { SelectPost } from "@motormetrics/database";
import { render, screen } from "@testing-library/react";
import { RecentPosts } from "@web/app/(main)/(dashboard)/components/recent-posts";

vi.mock("@heroui/react", () => ({
  Button: ({
    children,
    isIconOnly: _isIconOnly,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isIconOnly?: boolean;
  }) => (
    <button type="button" {...props}>
      {children}
    </button>
  ),
  Card: Object.assign(
    ({ children }: { children?: React.ReactNode }) => (
      <section>{children}</section>
    ),
    {
      Content: ({
        children,
        className,
      }: {
        children?: React.ReactNode;
        className?: string;
      }) => <div className={className}>{children}</div>,
    },
  ),
  Link: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  cn: (...classes: unknown[]) => classes.flat().filter(Boolean).join(" "),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

vi.mock("@web/app/(main)/(site)/blog/components/post", () => ({
  Post: {
    Card: ({ post }: { post: SelectPost }) => (
      <article data-testid={`post-card-${post.id}`}>
        <a href={`/blog/${post.slug}`}>{post.title}</a>
        <span data-testid={`post-date-${post.id}`}>
          {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString(
            "en-SG",
            { year: "numeric", month: "short", day: "numeric" },
          )}
        </span>
      </article>
    ),
  },
}));

describe("RecentPosts", () => {
  const mockPosts: SelectPost[] = [
    {
      id: "post-1",
      title: "First Post",
      slug: "first-post",
      content: "Content of first post",
      excerpt: "Excerpt",
      heroImage: null,
      tags: [],
      highlights: null,
      status: "published",
      metadata: null,
      month: "2024-01",
      dataType: "cars",
      embedding: null,
      createdAt: new Date("2024-01-15"),
      modifiedAt: new Date("2024-01-15"),
      publishedAt: new Date("2024-01-15"),
    },
    {
      id: "post-2",
      title: "Second Post",
      slug: "second-post",
      content: "Content of second post",
      excerpt: "Excerpt",
      heroImage: null,
      tags: [],
      highlights: null,
      status: "published",
      metadata: null,
      month: "2024-02",
      dataType: "coe",
      embedding: null,
      createdAt: new Date("2024-02-20"),
      modifiedAt: new Date("2024-02-20"),
      publishedAt: null,
    },
  ];

  it("should render title and view all link", () => {
    render(<RecentPosts posts={mockPosts} />);

    expect(document.body.firstChild).toMatchSnapshot();
    expect(screen.getByText("Recent Posts")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "View all blog posts" }),
    ).toBeInTheDocument();
  });

  it("should render all posts", () => {
    render(<RecentPosts posts={mockPosts} />);

    expect(screen.getByText("First Post")).toBeInTheDocument();
    expect(screen.getByText("Second Post")).toBeInTheDocument();
  });

  it("should render published date when available", () => {
    render(<RecentPosts posts={mockPosts} />);

    expect(screen.getByText("15 Jan 2024")).toBeInTheDocument();
  });

  it("should use createdAt when publishedAt is null", () => {
    render(<RecentPosts posts={mockPosts} />);

    expect(screen.getByText("20 Feb 2024")).toBeInTheDocument();
  });

  it("should render with empty posts", () => {
    render(<RecentPosts posts={[]} />);

    expect(screen.getByText("Recent Posts")).toBeInTheDocument();
    expect(screen.getByText("No recent posts available.")).toBeInTheDocument();
  });

  it("should render correctly with fewer than 3 posts", () => {
    const singlePost = [mockPosts[0]];
    render(<RecentPosts posts={singlePost} />);

    expect(screen.getByText("First Post")).toBeInTheDocument();
    expect(screen.queryByText("Second Post")).not.toBeInTheDocument();
  });

  it("should have links to blog posts", () => {
    render(<RecentPosts posts={mockPosts} />);

    const firstPostLink = screen.getByText("First Post").closest("a");
    expect(firstPostLink).toHaveAttribute("href", "/blog/first-post");

    const secondPostLink = screen.getByText("Second Post").closest("a");
    expect(secondPostLink).toHaveAttribute("href", "/blog/second-post");
  });

  it("should have link to blog page", () => {
    render(<RecentPosts posts={mockPosts} />);

    const link = screen.getByRole("link", { name: "View all blog posts" });
    expect(link).toHaveAttribute("href", "/blog");
  });
});
