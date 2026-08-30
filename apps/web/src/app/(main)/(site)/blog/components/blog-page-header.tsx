import { Typography } from "@heroui/react";

interface BlogPageHeaderProps {
  title: string;
  description: string;
}

export function BlogPageHeader({ title, description }: BlogPageHeaderProps) {
  return (
    <div className="flex max-w-3xl flex-col gap-2">
      <Typography.Heading level={1}>{title}</Typography.Heading>
      <Typography.Paragraph color="muted">{description}</Typography.Paragraph>
    </div>
  );
}
