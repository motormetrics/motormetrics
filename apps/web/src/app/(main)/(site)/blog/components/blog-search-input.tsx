"use client";

import { Button, Input } from "@heroui/react";
import { Search, X } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";

export function BlogSearchInput() {
  const [query, setQuery] = useQueryState(
    "q",
    parseAsString
      .withDefault("")
      .withOptions({ shallow: false, throttleMs: 300 }),
  );

  return (
    <div className="relative max-w-md">
      <Search className="pointer-events-none absolute top-1/2 left-5 size-4 -translate-y-1/2 text-muted" />
      <Input
        aria-label="Search blog posts"
        className="h-auto w-full rounded-full bg-surface py-3.5 pr-12 pl-12 font-medium shadow-surface"
        placeholder="Search posts"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {query ? (
        <Button
          aria-label="Clear search"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full"
          isIconOnly
          onPress={() => setQuery("")}
          size="sm"
          variant="tertiary"
        >
          <X className="size-4 text-muted" />
        </Button>
      ) : null}
    </div>
  );
}
