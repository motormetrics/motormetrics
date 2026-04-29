import { Divider } from "@heroui/divider";
import { Link } from "@heroui/link";
import Typography from "@web/components/typography";
import type { ComponentPropsWithoutRef } from "react";

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
  h1: (props: ComponentPropsWithoutRef<"h1">) => <Typography.H1 {...props} />,
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <Typography.H2 className="mt-12 mb-6" {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <Typography.H3
      className="mt-8 mb-4 border-primary border-l-4 pl-4"
      {...props}
    />
  ),
  h4: (props: ComponentPropsWithoutRef<"h4">) => (
    <Typography.H4 className="mt-6 mb-3" {...props} />
  ),

  // Body text
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <Typography.Text className="mb-6" {...props} />
  ),

  // Blockquotes - editorial style with subtle background
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="my-8 border-primary border-l-4 bg-default-50 py-4 pr-4 pl-6 text-default-700 text-lg italic"
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
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <Typography.InlineCode {...props} />
  ),

  // Links - styled for blog content
  a: ({ href, children }: ComponentPropsWithoutRef<"a">) => (
    <Link
      href={href ?? "#"}
      isExternal={href?.startsWith("http")}
      showAnchorIcon={href?.startsWith("http")}
      color="primary"
      underline="always"
      className="font-medium underline-offset-4"
    >
      {children}
    </Link>
  ),

  // Tables - Editorial style with accent border (HybridStyle)
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="my-8 w-full overflow-x-auto border-primary border-l-4 pl-4">
      <table className="w-full border-collapse" {...props} />
    </div>
  ),
  thead: (props: ComponentPropsWithoutRef<"thead">) => (
    <thead className="bg-transparent" {...props} />
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th
      scope="col"
      className="border-foreground border-b-2 px-4 py-3 text-left font-bold text-[10px] text-default-400 uppercase tracking-wider [&:not(:first-child)]:text-right [&[align=center]]:text-center [&[align=right]]:text-right"
      {...props}
    />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td
      className="px-4 py-3 text-sm tabular-nums [&:last-child]:font-semibold [&:last-child]:text-primary [&:not(:first-child)]:text-right [&[align=center]]:text-center [&[align=right]]:text-right"
      {...props}
    />
  ),
  tr: (props: ComponentPropsWithoutRef<"tr">) => (
    <tr
      className="border-default-100 border-b transition-colors last:border-none hover:bg-default-50"
      {...props}
    />
  ),

  // Horizontal rule
  hr: () => <Divider className="my-12" />,

  // Pre-formatted code blocks
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="my-6 overflow-x-auto rounded-lg bg-default-100 p-4 text-sm"
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
