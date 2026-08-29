import { Typography as HeroTypography } from "@heroui/react";
import type React from "react";

/**
 * Typography System — migration shim.
 *
 * The scale now lives in HeroUI (`Typography` from `@heroui/react`), which ships
 * the same ladder this file used to define by hand: 36/30/24/20/18/16/14/12,
 * `tracking-tight` on every heading. These are pass-throughs so call sites can
 * move to the direct import area by area instead of in one sweep.
 *
 * **This file is being deleted.** Do not add to it, and do not reach for it in
 * new code — import `Typography` from `@heroui/react` and use
 * `Typography.Heading` / `Typography.Paragraph` / `Typography.Code` directly.
 *
 *     H1..H4   ->  <Typography.Heading level={1..4}>
 *     TextLg   ->  <Typography.Paragraph color="muted">
 *     Text     ->  <Typography.Paragraph>
 *     TextSm   ->  <Typography.Paragraph size="sm" color="muted">
 *     Label    ->  <Typography.Paragraph size="sm" weight="medium">
 *     Caption  ->  <Typography.Paragraph size="xs" color="muted">
 *     InlineCode -> <Typography.Code>
 *
 * HeroUI's defaults are taken as-is. The app's former deviations — bold
 * headings, `lg:text-5xl` on H1, `scroll-m-20`, `text-balance`, `text-pretty` —
 * are deliberately dropped rather than reproduced here. `scroll-m-20` was
 * already redundant: every anchored section carries its own `scroll-mt-24`.
 */

type HeadingProps = React.ComponentProps<typeof HeroTypography.Heading>;
type ParagraphProps = React.ComponentProps<typeof HeroTypography.Paragraph>;
type CodeProps = React.ComponentProps<typeof HeroTypography.Code>;

/** Page title, one per page. 36px. */
const H1 = (props: Omit<HeadingProps, "level">) => (
  <HeroTypography.Heading level={1} {...props} />
);

/** Section title. 30px. */
const H2 = (props: Omit<HeadingProps, "level">) => (
  <HeroTypography.Heading level={2} {...props} />
);

/** Card title / subsection. 24px. */
const H3 = (props: Omit<HeadingProps, "level">) => (
  <HeroTypography.Heading level={3} {...props} />
);

/** Nested heading. 20px. */
const H4 = (props: Omit<HeadingProps, "level">) => (
  <HeroTypography.Heading level={4} {...props} />
);

/**
 * Lede paragraph. 16px muted — HeroUI's scale has no 18px *body* step (it jumps
 * from h5 at 18/600 to body at 16/400), so this is now the same size as `Text`.
 */
const TextLg = (props: Omit<ParagraphProps, "size">) => (
  <HeroTypography.Paragraph color="muted" {...props} />
);

/** Body copy. 16px. */
const Text = (props: Omit<ParagraphProps, "size">) => (
  <HeroTypography.Paragraph {...props} />
);

/** Secondary body / helper text. 14px muted. */
const TextSm = (props: Omit<ParagraphProps, "size">) => (
  <HeroTypography.Paragraph color="muted" size="sm" {...props} />
);

/** UI label. 14px medium. Renders `<p>`, not `<span>`, as of the HeroUI move. */
const Label = (props: Omit<ParagraphProps, "size">) => (
  <HeroTypography.Paragraph size="sm" weight="medium" {...props} />
);

/** Metadata / timestamps. 12px muted. Renders `<p>`, not `<span>`. */
const Caption = (props: Omit<ParagraphProps, "size">) => (
  <HeroTypography.Paragraph color="muted" size="xs" {...props} />
);

/** Inline code. */
const InlineCode = (props: CodeProps) => <HeroTypography.Code {...props} />;

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
  InlineCode,
};

export { Typography };
export default Typography;
