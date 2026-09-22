import { Typography } from "@heroui/react";
import { SharePill } from "@web/components/shared/share-pill";

/**
 * The comp's blog opening: topic pill, oversized title, lede, share pill hard
 * right. The `metadata` title stays the SEO one; this is what a reader sees.
 */
export function BlogHead({
  description,
  title,
}: {
  description: string;
  title: string;
}) {
  return (
    <div className="flex flex-wrap items-end gap-6">
      <div className="flex max-w-4xl flex-col gap-5">
        <span className="self-start rounded-full bg-accent-soft-2 px-4 py-2 font-bold text-accent-strong text-sm">
          Market commentary
        </span>
        <Typography.Heading level={1} className="text-5xl leading-none">
          {title}
        </Typography.Heading>
        <Typography.Paragraph
          color="muted"
          className="max-w-prose leading-normal"
        >
          {description}
        </Typography.Paragraph>
      </div>
      <div className="sm:ml-auto">
        <SharePill contentType="blog" title={title} />
      </div>
    </div>
  );
}
