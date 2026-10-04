import { Typography } from "@heroui/react";
import type { ComponentProps } from "react";
import { tv, type VariantProps } from "tailwind-variants";

/**
 * The few text styles HeroUI's Typography has no prop for. Everything else —
 * size, weight, the default and muted colours, truncation — stays on
 * Typography's own props, which the wrappers below pass straight through.
 *
 * - `tone="strong"`: the darker grey for secondary lines that sit nearer the
 *   foreground than `color="muted"`.
 * - `tone="inherit"`: takes the colour and weight from the parent, so a link's
 *   hover colour reaches the text inside it.
 * - `eyebrow`: the uppercase label above a heading. Its size comes from
 *   Typography's own `size="xs"`, not from this variant.
 */
export const textVariants = tv({
  variants: {
    tone: {
      strong: "text-muted-strong",
      // Tailwind has no font-weight inherit utility, so that half stays arbitrary.
      inherit: "text-inherit [font-weight:inherit]",
    },
    eyebrow: {
      true: "uppercase",
    },
  },
});

type TextVariants = VariantProps<typeof textVariants>;

function Heading({
  className,
  eyebrow,
  tone,
  ...props
}: ComponentProps<typeof Typography.Heading> & TextVariants) {
  return (
    <Typography.Heading
      {...props}
      className={textVariants({ className, eyebrow, tone })}
    />
  );
}

function Paragraph({
  className,
  eyebrow,
  tone,
  ...props
}: ComponentProps<typeof Typography.Paragraph> & TextVariants) {
  return (
    <Typography.Paragraph
      {...props}
      className={textVariants({ className, eyebrow, tone })}
    />
  );
}

export const Text = { Heading, Paragraph };
