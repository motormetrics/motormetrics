"use client";

import { Button, Chip } from "@heroui/react";

import type { Make, MakeStats } from "@web/types";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Key } from "react";
import { useCallback, useRef, useState } from "react";
import { MakeGrid } from "./make-grid";

interface AllMakesProps {
  title: string;
  sortedMakes: Make[];
  groupedMakes: Record<string, Make[]>;
  letters: string[];
  logoUrlMap?: Record<string, string>;
  makeStatsMap?: Record<string, MakeStats>;
}

export function AllMakes({
  title,
  sortedMakes,
  groupedMakes,
  letters,
  logoUrlMap = {},
  makeStatsMap,
}: AllMakesProps) {
  const [selectedLetter, setSelectedLetter] = useState(letters[0]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleSelectionChange = useCallback((key: Key) => {
    setSelectedLetter(String(key));
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const activeMakes =
    selectedLetter === "ALL"
      ? sortedMakes
      : (groupedMakes[selectedLetter] ?? []);

  if (sortedMakes.length === 0) return null;

  return (
    <section className="flex flex-col gap-6">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="font-semibold text-foreground text-lg">{title}</h2>
          <Chip variant="soft" color="accent" size="sm">
            {sortedMakes.length}
          </Chip>
        </div>
      </div>

      {/* Letter filter tabs */}
      <div className="relative flex items-center gap-2">
        <Button
          isIconOnly
          variant="outline"
          size="sm"
          className="rounded-full"
          onPress={() => scroll("left")}
          aria-label="Scroll left"
        >
          <ChevronLeft className="size-4" />
        </Button>

        <div
          ref={scrollContainerRef}
          className="flex flex-1 gap-1 overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {letters.map((letter) => (
            <Button
              key={letter}
              size="sm"
              className="shrink-0 rounded-full"
              variant={selectedLetter === letter ? "primary" : "tertiary"}
              aria-pressed={selectedLetter === letter}
              onPress={() => handleSelectionChange(letter)}
            >
              {letter}
            </Button>
          ))}
        </div>

        <Button
          isIconOnly
          variant="outline"
          size="sm"
          className="rounded-full"
          onPress={() => scroll("right")}
          aria-label="Scroll right"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {/* Results info and grid */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground">
            {selectedLetter === "#" ? "Other" : selectedLetter}
          </span>
          <span className="text-default-400">·</span>
          <span className="text-default-500 text-sm">
            {activeMakes.length} {activeMakes.length === 1 ? "make" : "makes"}
          </span>
        </div>
        <MakeGrid
          makes={activeMakes}
          logoUrlMap={logoUrlMap}
          makeStatsMap={makeStatsMap}
        />
      </div>
    </section>
  );
}
