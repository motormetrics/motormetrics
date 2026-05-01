"use client";

import { cn } from "@heroui/react";
import { BrandLogo } from "@web/components/brand-logo";
import { NAV_ITEMS, type NavItem } from "@web/config/navigation";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function Header() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: NavItem["href"]) => {
    if (path === "/") {
      return (
        !pathname.startsWith("/blog") &&
        !pathname.startsWith("/learn") &&
        !pathname.startsWith("/about")
      );
    }

    return pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-separator border-b bg-background/90 backdrop-blur-xl">
      <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            className="rounded-full p-2 text-foreground transition-colors hover:bg-surface-secondary md:hidden"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={() => setIsMenuOpen(false)}
          >
            <BrandLogo />
          </Link>
        </div>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = isActive(href);

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "rounded-full px-4 py-2 font-medium text-sm transition-all duration-200",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-surface-secondary text-foreground hover:bg-surface-tertiary",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </header>

      {isMenuOpen && (
        <div className="border-separator border-t bg-background/95 px-4 py-4 backdrop-blur-xl md:hidden">
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map(({ href, label }) => {
              const active = isActive(href);

              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "block w-full rounded-2xl px-4 py-3 text-lg transition-colors",
                      active
                        ? "bg-accent-soft font-semibold text-accent"
                        : "text-foreground/70 hover:bg-surface-secondary hover:text-foreground",
                    )}
                    aria-current={active ? "page" : undefined}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </nav>
  );
}
