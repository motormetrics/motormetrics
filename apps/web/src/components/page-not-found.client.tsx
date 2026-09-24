"use client";

import { Button } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { ArrowLeft, Home } from "lucide-react";
import Link from "next/link";

export function NavigationButtons() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <Link
        className={buttonVariants({
          className: "no-underline",
          size: "lg",
          variant: "primary",
        })}
        href="/"
      >
        <Home className="size-4" />
        Go to Homepage
      </Link>
      <Button variant="outline" onPress={() => window.history.back()} size="lg">
        <ArrowLeft className="size-4" />
        Go Back
      </Button>
    </div>
  );
}
