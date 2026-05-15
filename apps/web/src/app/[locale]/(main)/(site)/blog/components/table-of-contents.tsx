"use client";

import { cn, Link } from "@heroui/react";

import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  // Extract headings from the article on mount
  useEffect(() => {
    const article = document.querySelector("article");
    if (!article) return;

    const elements = article.querySelectorAll("h2");
    const items: TocItem[] = Array.from(elements)
      .filter((el) => el.id) // Only include elements with IDs
      .map((el) => ({
        id: el.id,
        text: el.textContent || "",
        level: 2,
      }));

    setHeadings(items);

    // Set initial active heading
    if (items.length > 0) {
      setActiveId(items[0].id);
    }
  }, []);

  // Track scroll position and update active heading
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          const topEntry = visibleEntries.reduce(
            (prev, current) =>
              prev.boundingClientRect.top < current.boundingClientRect.top
                ? prev
                : current,
            visibleEntries[0],
          );
          setActiveId(topEntry.target.id);
        }
      },
      {
        rootMargin: "-80px 0px -80% 0px",
        threshold: 0,
      },
    );

    for (const { id } of headings) {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="border-foreground border-b-2 pb-6">
      <div className="mb-4 font-bold text-foreground/60 text-xs uppercase tracking-[0.3em]">
        In This Report
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {headings.map((heading, idx) => (
          <Link
            key={heading.id}
            href={`#${heading.id}`}
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById(heading.id);
              if (element) {
                element.scrollIntoView({ behavior: "smooth" });
                setActiveId(heading.id);
              }
            }}
            className={cn(
              "group flex items-center gap-2 font-bold text-sm underline-offset-4 hover:underline",
              activeId === heading.id
                ? "text-foreground"
                : "text-foreground hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "text-xs transition-opacity",
                activeId === heading.id
                  ? "text-accent"
                  : "text-accent/60 group-hover:text-accent",
              )}
            >
              {String(idx + 1).padStart(2, "0")}
            </span>
            <span>{heading.text}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
