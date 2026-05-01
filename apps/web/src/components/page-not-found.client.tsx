"use client";

import { Button } from "@heroui/react";

import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

export function NavigationButtons() {
  return (
    <div className="mb-12 flex flex-col gap-4 sm:flex-row">
      <Link href="/" className="no-underline">
        <Button variant="primary" size="lg">
          <Home className="size-4" />
          Go to Homepage
        </Button>
      </Link>
      <Button variant="outline" onPress={() => window.history.back()} size="lg">
        <ArrowLeft className="size-4" />
        Go Back
      </Button>
    </div>
  );
}
