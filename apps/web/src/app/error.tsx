"use client";

import { Button, Typography } from "@heroui/react";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function AppError({
  error,
  retry,
}: Readonly<{
  error: Error & { digest?: string };
  retry: () => void;
}>) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-6 py-16">
      <div className="flex max-w-lg flex-col items-center gap-6 text-center">
        <AlertTriangle aria-hidden className="size-12 text-danger" />
        <div className="flex flex-col gap-2">
          <Typography.Heading level={1}>
            Something went wrong
          </Typography.Heading>
          <Typography.Paragraph color="muted">
            We couldn&apos;t load this page. You can try again, or head back to
            the homepage.
          </Typography.Paragraph>
        </div>
        {error.digest ? (
          <Typography.Paragraph color="muted" size="xs">
            Error ID: {error.digest}
          </Typography.Paragraph>
        ) : null}
        <Button onPress={() => retry()} size="lg" variant="primary">
          Try again
        </Button>
      </div>
    </div>
  );
}
