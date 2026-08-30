import { Typography } from "@heroui/react";
import { format } from "date-fns";

interface LastUpdatedProps {
  lastUpdated: number;
}

export function LastUpdated({ lastUpdated }: LastUpdatedProps) {
  return (
    <Typography.Paragraph color="muted" size="xs">
      Last updated:{" "}
      <span className="underline">
        {format(lastUpdated, "dd MMM yyyy, h:mma")}
      </span>
    </Typography.Paragraph>
  );
}
