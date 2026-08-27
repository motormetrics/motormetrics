"use client";

import type { Key } from "@heroui/react";

import { Button, cn, Dropdown, Label } from "@heroui/react";
import { BetaChip, NewChip } from "@web/components/shared/chips";
import type { NavigationItem } from "@web/config/navigation";
import { MORE_NAV_ITEMS, PRIMARY_NAV_ITEMS } from "@web/config/navigation";
import { SOCIAL_URLS } from "@web/config/socials";
import { ChevronDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const matchesPath = (pathname: string, href: string) => {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

// "/cars/electric-vehicles" matches both the Cars pill and the Electric pill,
// so the longest match wins and only one pill ever reads as active.
const getActiveHref = (pathname: string) =>
  PRIMARY_NAV_ITEMS.filter(({ href }) => matchesPath(pathname, href)).sort(
    (a, b) => b.href.length - a.href.length,
  )[0]?.href;

const pillClassName = (isActive: boolean) =>
  cn(
    "h-auto gap-2 rounded-full px-6 py-3.5 font-semibold text-base transition-shadow",
    isActive
      ? "bg-accent font-bold text-accent-foreground"
      : "bg-surface text-muted hover:text-foreground hover:shadow-surface",
  );

function NavMenuItems({ items }: { items: readonly NavigationItem[] }) {
  return items.map(({ badge, icon: Icon, title, url }) => (
    <Dropdown.Item id={url} key={url} textValue={title}>
      {Icon ? <Icon className="size-4 shrink-0 text-muted" /> : null}
      <Label className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate">{title}</span>
        {badge === "new" ? <NewChip /> : null}
        {badge === "beta" ? <BetaChip /> : null}
      </Label>
    </Dropdown.Item>
  ));
}

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();

  const activeHref = getActiveHref(pathname);
  const isMoreActive =
    !activeHref && MORE_NAV_ITEMS.some(({ url }) => matchesPath(pathname, url));

  const handleNavigate = (key: Key) => router.push(String(key));

  return (
    <nav aria-label="Main navigation">
      <div className="flex flex-wrap items-center gap-4">
        <Link
          aria-label="MotorMetrics home"
          className="flex size-13 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground"
          href="/"
        >
          <TrendingUp className="size-6" strokeWidth={2.5} />
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {PRIMARY_NAV_ITEMS.map(({ href, items, label }) => {
            const isActive = href === activeHref;

            if (!items) {
              return (
                <Link
                  className={cn(
                    "rounded-full px-7 py-3.5 font-semibold text-base transition-shadow",
                    isActive
                      ? "bg-accent font-bold text-accent-foreground"
                      : "bg-surface text-muted hover:text-foreground hover:shadow-surface",
                  )}
                  href={href}
                  key={href}
                >
                  {label}
                </Link>
              );
            }

            return (
              <Dropdown key={href}>
                <Button className={pillClassName(isActive)} variant="tertiary">
                  {label}
                  <ChevronDown className="size-4 shrink-0" strokeWidth={2.25} />
                </Button>
                <Dropdown.Popover className="min-w-64" placement="bottom start">
                  <Dropdown.Menu onAction={handleNavigate}>
                    <Dropdown.Item
                      id={href}
                      key={href}
                      textValue={`${label} overview`}
                    >
                      <Label className="font-semibold">{`${label} overview`}</Label>
                    </Dropdown.Item>
                    <NavMenuItems items={items} />
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            );
          })}

          <Dropdown>
            <Button
              className={cn(
                pillClassName(false),
                isMoreActive && "bg-accent/15 font-bold text-accent-strong",
              )}
              variant="tertiary"
            >
              More
              <ChevronDown className="size-4 shrink-0" strokeWidth={2.25} />
            </Button>
            <Dropdown.Popover className="min-w-64" placement="bottom start">
              <Dropdown.Menu onAction={handleNavigate}>
                <NavMenuItems items={MORE_NAV_ITEMS} />
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>

        <Link
          className="ml-auto rounded-full bg-foreground px-6 py-3.5 font-bold text-accent-foreground text-sm transition-colors hover:bg-muted"
          href={SOCIAL_URLS.telegram}
          rel="noopener noreferrer"
          target="_blank"
        >
          Get updates
        </Link>
      </div>

      {/* TODO: The comp's search field and notification bell are decorative —
          neither is reproduced here because there is nothing to wire them to. */}
    </nav>
  );
}
