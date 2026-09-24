"use client";

import { Button } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { Home, RotateCcw } from "lucide-react";
import Link from "next/link";

export function DefaultActions() {
  return (
    <div className="flex items-center gap-4">
      <Link
        className={buttonVariants({
          className: "rounded-full no-underline",
          variant: "outline",
        })}
        href="/"
      >
        <Home className="size-4" />
        Go Home
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
