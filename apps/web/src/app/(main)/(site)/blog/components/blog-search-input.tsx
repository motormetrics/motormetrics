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
    <div className="relative">
      <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
      <Input
        aria-label="Search blog posts"
        className="w-full rounded-full pr-10 pl-9"
        placeholder="Search blog posts..."
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="absolute top-1/2 right-1 -translate-y-1/2">
        {query ? (
          <Button
            variant="tertiary"
            size="sm"
            onPress={() => setQuery("")}
            aria-label="Clear search"
          >
            <X className="size-4 text-muted" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}
