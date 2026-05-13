import { Text } from "@heroui/react";
import { format } from "date-fns";

interface LastUpdatedProps {
  lastUpdated: number;
}

export function LastUpdated({ lastUpdated }: LastUpdatedProps) {
  return (
    <Text type="body-xs" color="muted">
      Last updated:{" "}
      <span className="underline">
        {format(lastUpdated, "dd MMM yyyy, h:mma")}
      </span>
    </Text>
  );
}
