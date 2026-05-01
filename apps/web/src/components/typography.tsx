import { cn } from "@heroui/react";
import React from "react";

/**
 * Typography System
 *
 * Modern, elegant design inspired by Vercel, Linear, and Stripe.
 * Uses lighter font weights and relies on size/spacing for hierarchy.
 *
 * Principles:
 * - Semibold (600) for primary headings
 * - Medium (500) for secondary headings and labels
 * - Normal (400) for body text
 * - Bold reserved for data emphasis (numbers, metrics)
 */

/**
 * H1 - Page titles
 *
 * Use for: Primary page heading (one per page)
 * Weight: Semibold (600)
 *
 * @example
 * <Typography.H1>COE Overview</Typography.H1>
 */
const H1 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h1
    ref={ref}
    className={cn(
      "scroll-m-20 font-semibold text-4xl text-foreground tracking-tight lg:text-5xl",
      className,
    )}
    {...props}
  />
));
H1.displayName = "H1";

/**
 * H2 - Section titles
 *
 * Use for: Major sections, card groups
 * Weight: Semibold (600)
 *
 * @example
 * <Typography.H2>Fun Facts</Typography.H2>
 */
const H2 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "scroll-m-20 font-semibold text-3xl text-foreground tracking-tight first:mt-0",
      className,
    )}
    {...props}
  />
));
H2.displayName = "H2";

/**
 * H3 - Subsection titles
 *
 * Use for: Card titles, subsections
 * Weight: Medium (500) - lighter for better hierarchy
 *
 * @example
 * <Typography.H3>Category A vs B</Typography.H3>
 */
const H3 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "scroll-m-20 font-medium text-2xl text-foreground tracking-tight",
      className,
    )}
    {...props}
  />
));
H3.displayName = "H3";

/**
 * H4 - Small headings
 *
 * Use for: Nested sections, list headers
 * Weight: Medium (500)
 *
 * @example
 * <Typography.H4>Latest PQP Rates</Typography.H4>
 */
const H4 = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h4
    ref={ref}
    className={cn(
      "scroll-m-20 font-medium text-default-900 text-xl tracking-tight",
      className,
    )}
    {...props}
  />
));
H4.displayName = "H4";

/**
 * TextLg - Large body text
 *
 * Use for: Introductions, lead paragraphs, emphasized content
 * Font size: 18px (text-lg)
 * Weight: Normal (400)
 *
 * @example
 * <Typography.TextLg>Explore COE trends and analysis.</Typography.TextLg>
 */
const TextLg = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-foreground text-lg leading-relaxed", className)}
    {...props}
  />
));
TextLg.displayName = "TextLg";

/**
 * Text - Standard body text
 *
 * Use for: Paragraphs, descriptions, general content
 * Font size: 16px (text-base)
 * Weight: Normal (400)
 *
 * @example
 * <Typography.Text>The latest COE results show...</Typography.Text>
 */
const Text = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-base text-foreground leading-7", className)}
    {...props}
  />
));
Text.displayName = "Text";

/**
 * TextSm - Small body text
 *
 * Use for: Secondary descriptions, helper text
 * Font size: 14px (text-sm)
 * Weight: Normal (400)
 *
 * @example
 * <Typography.TextSm>Updated daily from LTA</Typography.TextSm>
 */
const TextSm = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-default-600 text-sm leading-6", className)}
    {...props}
  />
));
TextSm.displayName = "TextSm";

/**
 * Label - UI labels
 *
 * Use for: Form labels, navigation items, tabs
 * Weight: Medium (500)
 *
 * @example
 * <Typography.Label>Select Month</Typography.Label>
 */
const Label = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "font-medium text-foreground text-sm leading-none",
      className,
    )}
    {...props}
  />
));
Label.displayName = "Label";

/**
 * Caption - Metadata text
 *
 * Use for: Timestamps, data sources, footnotes
 * Weight: Normal (400)
 *
 * @example
 * <Typography.Caption>Last updated: 29 Oct 2025</Typography.Caption>
 */
const Caption = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn("text-default-500 text-xs leading-tight", className)}
    {...props}
  />
));
Caption.displayName = "Caption";

// Legacy components for backward compatibility
const P = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("not-first:mt-6 leading-7", className)}
    {...props}
  />
));
P.displayName = "P";

const Blockquote = React.forwardRef<
  HTMLQuoteElement,
  React.HTMLAttributes<HTMLQuoteElement>
>(({ className, ...props }, ref) => (
  <blockquote
    ref={ref}
    className={cn("mt-6 border-l-2 pl-6 italic", className)}
    {...props}
  />
));
Blockquote.displayName = "Blockquote";

const List = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement>
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)}
    {...props}
  />
));
List.displayName = "List";

const InlineCode = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <code
    ref={ref}
    className={cn(
      "relative rounded-sm bg-surface-secondary px-[0.3rem] py-[0.2rem] font-medium font-mono text-sm",
      className,
    )}
    {...props}
  />
));
InlineCode.displayName = "InlineCode";

const Lead = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-default-500 text-xl leading-relaxed", className)}
    {...props}
  />
));
Lead.displayName = "Lead";

const Typography = {
  // Headings
  H1,
  H2,
  H3,
  H4,
  // Body Text
  TextLg,
  Text,
  TextSm,
  // UI Labels
  Label,
  Caption,
  // Content Elements
  P,
  Blockquote,
  List,
  InlineCode,
  Lead,
};

export { Typography };
export default Typography;
