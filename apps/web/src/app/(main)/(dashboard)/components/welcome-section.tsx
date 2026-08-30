import { Typography } from "@heroui/react";

export function WelcomeSection() {
  return (
    <div className="flex flex-col justify-center gap-2">
      <Typography.Heading level={1} className="lg:text-6xl">
        Overview
      </Typography.Heading>
    </div>
  );
}
