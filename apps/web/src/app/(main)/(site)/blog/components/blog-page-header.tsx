import Typography from "@web/components/typography";

interface BlogPageHeaderProps {
  title: string;
  description: string;
}

export function BlogPageHeader({ title, description }: BlogPageHeaderProps) {
  return (
    <div className="flex max-w-3xl flex-col gap-2">
      <Typography.H1>{title}</Typography.H1>
      <Typography.TextLg className="text-muted">
        {description}
      </Typography.TextLg>
    </div>
  );
}
