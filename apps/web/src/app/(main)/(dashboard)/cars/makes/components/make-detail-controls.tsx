"use client";

import { Button } from "@heroui/react";
import { makesSearchParams } from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import type { ComponentProps, ReactNode } from "react";

type ButtonVariant = ComponentProps<typeof Button>["variant"];

/**
 * Turns picking a second make on or off (`?compare=`). A button rather than a
 * link, so the comparison view of a make is not a URL for a crawler to
 * follow; `shallow: false` has the server render it.
 */
export function CompareToggle({
  children,
  className,
  comparing,
  variant,
}: {
  children: ReactNode;
  className?: string;
  /** Whether a second make is being picked now. */
  comparing: boolean;
  variant: ButtonVariant;
}) {
  const [, setCompare] = useQueryState(
    "compare",
    makesSearchParams.compare.withOptions({
      history: "push",
      scroll: false,
      shallow: false,
    }),
  );

  return (
    <Button
      aria-expanded={comparing}
      className={className}
      onPress={() => setCompare(comparing ? null : true)}
      size="sm"
      variant={variant}
    >
      {children}
    </Button>
  );
}

/** A quick pick into the comparison with the selected make. */
export function ComparePick({
  children,
  href,
}: {
  children: ReactNode;
  /** The comparison page for the two makes. */
  href: string;
}) {
  const router = useRouter();

  return (
    <Button onPress={() => router.push(href)} size="sm" variant="secondary">
      {children}
    </Button>
  );
}
