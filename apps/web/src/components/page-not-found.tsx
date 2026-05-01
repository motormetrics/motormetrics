import Typography from "@web/components/typography";
import Link from "next/link";
import { NavigationButtons } from "./page-not-found.client";

export function PageNotFound() {
  return (
    <div className="container mx-auto px-6 py-16">
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <div className="mb-8 flex flex-col items-center">
          <Typography.H1 className="text-accent">404</Typography.H1>
          <Typography.H2>Page Not Found</Typography.H2>
          <Typography.TextLg>
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </Typography.TextLg>
        </div>

        <NavigationButtons />

        <Typography.TextSm>
          Need help? Visit our{" "}
          <Link href="/learn" className="text-accent hover:underline">
            learn page
          </Link>{" "}
          or go back to the{" "}
          <Link href="/" className="text-accent hover:underline">
            homepage
          </Link>
          .
        </Typography.TextSm>
      </div>
    </div>
  );
}
