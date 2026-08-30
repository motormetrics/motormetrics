import { Typography } from "@heroui/react";
import Link from "next/link";
import { NavigationButtons } from "./page-not-found.client";

export function PageNotFound() {
  return (
    <div className="container mx-auto px-6 py-16">
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="mb-8 flex flex-col items-center">
          <Typography.Heading level={1} className="text-accent-strong">
            404
          </Typography.Heading>
          <Typography.Heading level={2}>Page Not Found</Typography.Heading>
          <Typography.Paragraph color="muted">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </Typography.Paragraph>
        </div>

        <NavigationButtons />

        <Typography.Paragraph color="muted" size="sm">
          Need help? Visit our{" "}
          <Link href="/learn" className="text-accent-strong hover:underline">
            learn page
          </Link>{" "}
          or go back to the{" "}
          <Link href="/" className="text-accent-strong hover:underline">
            homepage
          </Link>
          .
        </Typography.Paragraph>
      </div>
    </div>
  );
}
