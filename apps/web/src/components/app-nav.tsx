"use client";

import type { Key } from "@heroui/react";

import { Button, cn, Dropdown, Header, Label, Separator } from "@heroui/react";
import { BetaChip, NewChip } from "@web/components/shared/chips";
import { MORE_NAV_GROUPS, PRIMARY_NAV_ITEMS } from "@web/config/navigation";
import { SOCIAL_URLS } from "@web/config/socials";
import { ChevronDown, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment } from "react";

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

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();

  const activeHref = getActiveHref(pathname);
  const isMoreActive =
    !activeHref &&
    MORE_NAV_GROUPS.some(({ items }) =>
      items.some(({ url }) => matchesPath(pathname, url)),
    );

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
          {PRIMARY_NAV_ITEMS.map(({ href, label }) => {
            const isActive = href === activeHref;

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
          })}

          <Dropdown>
            <Button
              className={cn(
                "h-auto gap-2 rounded-full px-6 py-3.5 font-semibold text-base transition-shadow",
                isMoreActive
                  ? "bg-accent/15 font-bold text-accent-strong"
                  : "bg-surface text-muted hover:text-foreground hover:shadow-surface",
              )}
              variant="tertiary"
            >
              More
              <ChevronDown className="size-4 shrink-0" strokeWidth={2.25} />
            </Button>
            <Dropdown.Popover className="min-w-64" placement="bottom start">
              <Dropdown.Menu onAction={handleNavigate}>
                {MORE_NAV_GROUPS.map(({ items, title }, index) => (
                  <Fragment key={title}>
                    {index > 0 ? <Separator /> : null}
                    <Dropdown.Section>
                      <Header>{title}</Header>
                      {items.map(({ badge, icon: Icon, title: label, url }) => (
                        <Dropdown.Item id={url} key={url} textValue={label}>
                          {Icon ? (
                            <Icon className="size-4 shrink-0 text-muted" />
                          ) : null}
                          <Label className="flex min-w-0 flex-1 items-center gap-2">
                            <span className="truncate">{label}</span>
                            {badge === "new" ? <NewChip /> : null}
                            {badge === "beta" ? <BetaChip /> : null}
                          </Label>
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Section>
                  </Fragment>
                ))}
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
