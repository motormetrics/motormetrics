"use client";

import { cn, Typography } from "@heroui/react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface TocItem {
  id: string;
  text: string;
}

/**
 * The comp's "In this post" rail card. The headings are read out of the
 * rendered article, so the list cannot fall out of step with it, and the ids
 * are the ones `rehype-slug` gave the headings.
 */
export function TableOfContents() {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const article = document.querySelector("article");
    if (!article) return;

    const items: TocItem[] = Array.from(article.querySelectorAll("h2"))
      .filter((el) => el.id)
      .map((el) => ({ id: el.id, text: el.textContent || "" }));

    setHeadings(items);

    if (items.length > 0) {
      setActiveId(items[0].id);
    }
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length > 0) {
          const top = visible.reduce(
            (prev, current) =>
              prev.boundingClientRect.top < current.boundingClientRect.top
                ? prev
                : current,
            visible[0],
          );
          setActiveId(top.target.id);
        }
      },
      { rootMargin: "-80px 0px -80% 0px", threshold: 0 },
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
    <nav
      aria-label="In this post"
      className="flex flex-col gap-3.5 rounded-2xl bg-surface-secondary p-7"
    >
      <Typography.Heading level={4} className="text-base">
        In this post
      </Typography.Heading>
      <ol className="flex flex-col gap-0.5">
        {headings.map((heading) => {
          const active = activeId === heading.id;

          return (
            <li key={heading.id}>
              <Link
                aria-current={active ? "location" : undefined}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm no-underline transition-colors",
                  active
                    ? "bg-surface font-bold text-foreground"
                    : "font-semibold text-muted hover:bg-surface hover:text-foreground",
                )}
                href={`#${heading.id}`}
                onClick={(event) => {
                  event.preventDefault();
                  document
                    .getElementById(heading.id)
                    ?.scrollIntoView({ behavior: "smooth" });
                  setActiveId(heading.id);
                }}
              >
                {heading.text}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
