"use client";

import { SearchField } from "@heroui/react";
import { parseAsString, useQueryState } from "nuqs";

export function BlogSearchInput() {
  const [query, setQuery] = useQueryState(
    "q",
    parseAsString
      .withDefault("")
      .withOptions({ shallow: false, throttleMs: 300 }),
  );

  return (
    <SearchField
      aria-label="Search blog posts"
      className="max-w-md"
      fullWidth
      onChange={setQuery}
      value={query}
    >
      <SearchField.Group>
        <SearchField.SearchIcon />
        <SearchField.Input placeholder="Search posts" />
        <SearchField.ClearButton />
      </SearchField.Group>
    </SearchField>
  );
}
