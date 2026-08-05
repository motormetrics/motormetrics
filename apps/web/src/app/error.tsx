"use client";

import { Button } from "@heroui/react";
import Typography from "@web/components/typography";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-6 py-16">
      <div className="flex max-w-lg flex-col items-center gap-6 text-center">
        <AlertTriangle aria-hidden className="size-12 text-danger" />
        <div className="flex flex-col gap-2">
          <Typography.H1>Something went wrong</Typography.H1>
          <Typography.TextLg className="text-muted">
            We couldn&apos;t load this page. You can try again, or head back to
            the homepage.
          </Typography.TextLg>
        </div>
        {error.digest ? (
          <Typography.Caption>Error ID: {error.digest}</Typography.Caption>
        ) : null}
        <Button onPress={() => retry()} size="lg" variant="primary">
          Try again
        </Button>
      </div>
    </div>
  );
}
