"use client";

import { AlertTriangle } from "lucide-react";
import { Geist } from "next/font/google";
import { useEffect } from "react";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
});

export default function GlobalError({
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
    <html data-theme="light" lang="en">
      <body
        className={`${geistSans.className} bg-background text-foreground antialiased`}
      >
        <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-6 py-16">
          <div className="flex max-w-lg flex-col items-center gap-6 text-center">
            <AlertTriangle aria-hidden className="size-12 text-danger" />
            <div className="flex flex-col gap-2">
              <h1 className="font-semibold text-4xl text-foreground lg:text-5xl">
                Something went wrong
              </h1>
              <p className="text-lg text-muted leading-relaxed">
                A critical error occurred. Please try again.
              </p>
            </div>
            {error.digest ? (
              <p className="text-default-500 text-xs leading-tight">
                Error ID: {error.digest}
              </p>
            ) : null}
            <button
              className="cursor-pointer rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground"
              onClick={() => retry()}
              type="button"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
