import { Text } from "@heroui/react";
import Link from "next/link";
import { NavigationButtons } from "./page-not-found.client";

export function PageNotFound() {
  return (
    <div className="container mx-auto px-6 py-16">
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="mb-8 flex flex-col items-center">
          <Text type="h1">404</Text>
          <Text type="h2">Page Not Found</Text>
          <Text type="body">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </Text>
        </div>

        <NavigationButtons />

        <Text type="body-sm" color="muted">
          Need help? Visit our{" "}
          <Link href="/learn" className="text-accent hover:underline">
            learn page
          </Link>{" "}
          or go back to the{" "}
          <Link href="/" className="text-accent hover:underline">
            homepage
          </Link>
          .
        </Text>
      </div>
    </div>
  );
}
