import { Typography } from "@heroui/react";
import type { ReactNode } from "react";

/**
 * Direction D's head grid: the head on the left and the key numbers beside
 * it once the column is wide, under it before then.
 *
 * Holds no state, so client components such as the calculators can use it.
 */
export function HeadGrid({
  children,
  keys,
}: {
  children: ReactNode;
  keys: ReactNode;
}) {
  return (
    <div className="@container">
      <div className="grid @7xl:grid-cols-2 @7xl:gap-16 gap-8">
        <div className="flex min-w-0 flex-col gap-4">{children}</div>
        {keys}
      </div>
    </div>
  );
}

/** Eyebrow and H1, the same scale as the Makes head. */
export function HeadTitle({
  eyebrow,
  title,
}: {
  eyebrow: ReactNode;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <Typography.Paragraph
        className="uppercase"
        color="muted"
        size="xs"
        weight="semibold"
      >
        {eyebrow}
      </Typography.Paragraph>
      <Typography.Heading level={1}>{title}</Typography.Heading>
    </div>
  );
}
