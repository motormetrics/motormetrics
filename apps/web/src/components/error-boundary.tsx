"use client";

import { Button, Typography } from "@heroui/react";
import { AlertTriangle } from "lucide-react";
import { catchError, type ErrorInfo } from "next/error";

type SectionErrorFallbackProps = Readonly<{
  title?: string;
}>;

export function SectionErrorFallback(
  { title = "This section failed to load" }: SectionErrorFallbackProps,
  { error, retry }: ErrorInfo,
) {
  const message =
    error instanceof Error
      ? error.message
      : "Something went wrong while loading this data.";

  return (
    <div
      className="flex flex-col items-start gap-4 rounded-2xl border border-danger/20 bg-danger/5 p-6"
      role="alert"
    >
      <div className="flex items-center gap-3">
        <AlertTriangle aria-hidden className="size-5 text-danger" />
        <Typography.Heading level={4}>{title}</Typography.Heading>
      </div>
      <Typography.Paragraph color="muted" size="sm">
        {message}
      </Typography.Paragraph>
      <Button onPress={() => retry()} size="sm" variant="primary">
        Try again
      </Button>
    </div>
  );
}

/**
 * Component-level error boundary for dashboard data sections.
 * Uses Next.js 16.3 `catchError` so `retry()` re-fetches Server Component children.
 */
export const SectionErrorBoundary = catchError(SectionErrorFallback);
