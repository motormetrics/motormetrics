import { Separator, Text } from "@heroui/react";
import type { Route } from "next";
import NextLink from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type MdxLinkProps = ComponentPropsWithoutRef<"a">;
type MdxHeadingProps = Omit<
  ComponentPropsWithoutRef<typeof Text.Heading>,
  "level"
>;

function MdxLink({ href = "", children, className, ...props }: MdxLinkProps) {
  if (!href) {
    return <>{children}</>;
  }

  const isInternalLink =
    (href.startsWith("/") && !href.startsWith("//")) || href.startsWith("#");
  const isExternalWebLink = /^https?:\/\//i.test(href);
  const linkClassName = [
    "font-medium text-accent underline underline-offset-4",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (isInternalLink) {
    return (
      <NextLink {...props} href={href as Route} className={linkClassName}>
        {children}
      </NextLink>
    );
  }

  return (
    <a
      {...props}
      href={href}
      target={isExternalWebLink ? "_blank" : undefined}
      rel={isExternalWebLink ? "noopener noreferrer nofollow" : undefined}
      className={linkClassName}
    >
      {children}
    </a>
  );
}

/**
 * MDX Components Mapping
 *
 * Maps MDX/Markdown HTML elements to HeroUI typography primitives and
 * route-specific authored content elements.
 *
 * Used by MDXRemote in blog post rendering.
 */
export const mdxComponents = {
  // Headings
  h1: (props: MdxHeadingProps) => <Text.Heading level={1} {...props} />,
  h2: (props: MdxHeadingProps) => <Text.Heading level={2} {...props} />,
  h3: (props: MdxHeadingProps) => <Text.Heading level={3} {...props} />,
  h4: (props: MdxHeadingProps) => <Text.Heading level={4} {...props} />,

  // Body text
  p: (props: ComponentPropsWithoutRef<typeof Text.Paragraph>) => (
    <Text.Paragraph {...props} />
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
      className="border-foreground border-b-2 px-4 py-3 text-left font-bold text-[10px] text-muted uppercase tracking-wider [&:not(:first-child)]:text-right [&[align=center]]:text-center [&[align=right]]:text-right"
      {...props}
    />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td
      className="px-4 py-3 text-sm tabular-nums [&:last-child]:font-semibold [&:last-child]:text-accent [&:not(:first-child)]:text-right [&[align=center]]:text-center [&[align=right]]:text-right"
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

  // Strong/Bold - slightly heavier for emphasis
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold text-foreground" {...props} />
  ),

  // Emphasis/Italic
  em: (props: ComponentPropsWithoutRef<"em">) => (
    <em className="italic" {...props} />
  ),
};
