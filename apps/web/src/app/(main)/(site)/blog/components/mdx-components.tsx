import { Separator, Typography } from "@heroui/react";
import type { Route } from "next";
import NextLink from "next/link";
import type { ComponentPropsWithoutRef, JSX } from "react";

type MdxLinkProps = ComponentPropsWithoutRef<"a">;

/**
 * MDX hands us raw HTML props, which still carry the deprecated presentational
 * `color` and `align` attributes. HeroUI's Typography reserves both as its own
 * props with narrower types, so they are dropped here rather than spread.
 */
type MdxProps<T extends keyof JSX.IntrinsicElements> = Omit<
  ComponentPropsWithoutRef<T>,
  "color" | "align"
>;

function MdxLink({ href = "", children, className, ...props }: MdxLinkProps) {
  const isInternalLink = href.startsWith("/") || href.startsWith("#");
  const linkClassName = [
    "font-medium text-accent-strong underline underline-offset-4",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (isInternalLink) {
    return (
      <NextLink href={href as Route} className={linkClassName} {...props}>
        {children}
      </NextLink>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className={linkClassName}
      {...props}
    >
      {children}
    </a>
  );
}

/**
 * MDX Components Mapping
 *
 * Maps MDX/Markdown HTML elements to our custom Typography components
 * with NYT/Washington Post-inspired editorial styling.
 *
 * Used by MDXRemote in blog post rendering.
 */
export const mdxComponents = {
  // Headings - with generous spacing for editorial feel
  h1: (props: MdxProps<"h1">) => <Typography.Heading level={1} {...props} />,
  h2: (props: MdxProps<"h2">) => (
    <Typography.Heading level={2} className="mt-12 mb-6" {...props} />
  ),
  h3: (props: MdxProps<"h3">) => (
    <Typography.Heading
      level={3}
      className="mt-8 mb-4 border-accent border-l-4 pl-4"
      {...props}
    />
  ),
  h4: (props: MdxProps<"h4">) => (
    <Typography.Heading level={4} className="mt-6 mb-3" {...props} />
  ),

  // Body text
  p: (props: MdxProps<"p">) => (
    <Typography.Paragraph className="mb-6" {...props} />
  ),

  // Blockquotes - editorial style with subtle background
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="my-8 border-accent border-l-4 bg-default py-4 pr-4 pl-6 text-foreground text-lg italic"
      {...props}
    />
  ),

  // Lists
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="my-6 ml-6 list-disc space-y-2" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="my-6 ml-6 list-decimal space-y-2" {...props} />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li className="text-base text-foreground leading-7" {...props} />
  ),

  // Code (inline)
  code: (props: MdxProps<"code">) => <Typography.Code {...props} />,

  // Links - styled for blog content
  a: MdxLink,

  // Tables - Editorial style with accent border (HybridStyle)
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="my-8 w-full overflow-x-auto border-accent border-l-4 pl-4">
      <table className="w-full border-collapse" {...props} />
    </div>
  ),
  thead: (props: ComponentPropsWithoutRef<"thead">) => (
    <thead className="bg-transparent" {...props} />
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th
      scope="col"
      className="border-foreground border-b-2 px-4 py-3 text-left font-bold text-muted text-xs uppercase tracking-wider [&:not(:first-child)]:text-right [&[align=center]]:text-center [&[align=right]]:text-right"
      {...props}
    />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td
      className="px-4 py-3 text-sm tabular-nums [&:last-child]:font-semibold [&:last-child]:text-accent-strong [&:not(:first-child)]:text-right [&[align=center]]:text-center [&[align=right]]:text-right"
      {...props}
    />
  ),
  tr: (props: ComponentPropsWithoutRef<"tr">) => (
    <tr
      className="border-border border-b transition-colors last:border-none hover:bg-default"
      {...props}
    />
  ),

  // Horizontal rule
  hr: () => <Separator className="my-12" />,

  // Pre-formatted code blocks
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="my-6 overflow-x-auto rounded-lg bg-default p-4 text-sm"
      {...props}
    />
  ),

  // Strong/Bold - slightly heavier for emphasis
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),

  // Emphasis/Italic
  em: (props: ComponentPropsWithoutRef<"em">) => (
    <em className="italic" {...props} />
  ),
};
