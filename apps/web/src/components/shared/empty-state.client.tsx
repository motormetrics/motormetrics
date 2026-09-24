"use client";

import { Button } from "@heroui/react";

import { Home, RotateCcw } from "lucide-react";
import Link from "next/link";

export function DefaultActions() {
  return (
    <div className="flex items-center gap-4">
      <Link href="/" className="no-underline">
        <Button className="rounded-full" variant="outline">
          <Home className="size-4" />
          Go Home
        </Button>
      </Link>
      <Button
        className="rounded-full"
        variant="outline"
        onPress={() => history.back()}
      >
        <RotateCcw className="size-4" />
        Go Back
      </Button>
    </div>
  );
}
