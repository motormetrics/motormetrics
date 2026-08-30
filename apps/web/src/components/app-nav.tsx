"use client";

import type { Key } from "@heroui/react";
import { Button, cn, Dropdown, Header, Label } from "@heroui/react";
import { Navbar } from "@heroui-pro/react";
import { BetaChip, NewChip } from "@web/components/shared/chips";
import {
  MORE_NAV_ITEMS,
  MORE_NAV_SECTION_LABEL,
  type NavigationItem,
  PRIMARY_NAV_ITEMS,
} from "@web/config/navigation";
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

// Menu chrome from the MMNav comp: rows are 14px-radius pills rather than the
// 32px HeroUI default, and section labels are small uppercase eyebrows.
const menuItemClassName =
  "rounded-sm px-3.5 py-2.25 font-semibold text-muted-strong text-sm";

// HeroUI's .menu-section ships flat (gap-0), so the eyebrow reads as just
// another row by default, and spacing alone cannot fix that — the rows sit on
// a ~35px rhythm that a gap has to clearly beat before it registers as a
// break. Nothing else in this UI carries a border, so the separation is tonal:
// the eyebrow takes the warm surface tier while the rows keep the white
// overlay. It stays inside the menu padding and shares the rows' px-3.5 and
// radius, so it reads as a tinted label row rather than a slab.
const menuHeaderClassName =
  "col-span-full mb-1.5 rounded-sm bg-surface-secondary px-3.5 py-2.5 font-bold text-subtle text-xs uppercase tracking-widest";

// The comp runs a long menu in two columns. Short menus stay in one so the
// popover never opens wider than the handful of rows it holds.
const menuGrid = (itemCount: number) =>
  cn("grid gap-x-2.5 gap-y-0.5", itemCount > 4 ? "grid-cols-2" : "grid-cols-1");

const menuClassName = (itemCount: number) =>
  // `md:` because 112 (448px) is wider than a phone, and these popovers only
  // ever open from the desktop pills.
  cn(menuGrid(itemCount), "p-2.5", itemCount > 4 && "md:min-w-112");

// A section is a grid item of the menu, and re-declares the same columns so its
// own rows line up with the ones outside it.
const menuSectionClassName = (itemCount: number) =>
  cn(menuGrid(itemCount), "col-span-full");

function NavMenuItems({ items }: { items: readonly NavigationItem[] }) {
  return items.map(({ badge, title, url }) => (
    <Dropdown.Item
      className={menuItemClassName}
      id={url}
      key={url}
      textValue={title}
    >
      <Label className="flex min-w-0 flex-1 items-center gap-2">
        <span className="truncate">{title}</span>
        {badge === "new" ? <NewChip /> : null}
        {badge === "beta" ? <BetaChip /> : null}
      </Label>
    </Dropdown.Item>
  ));
}

/** One row of the phone menu. Pressing it closes the menu on its own. */
function MobileMenuLink({
  badge,
  href,
  isCurrent,
  label,
}: {
  badge?: NavigationItem["badge"];
  href: string;
  isCurrent: boolean;
  label: string;
}) {
  return (
    <Navbar.MenuItem
      className="flex items-center gap-2 py-2.5 font-semibold text-base"
      href={href}
      isCurrent={isCurrent}
    >
      {label}
      {badge === "new" ? <NewChip /> : null}
      {badge === "beta" ? <BetaChip /> : null}
    </Navbar.MenuItem>
  );
}

export function AppNav({
  moreNavItems = MORE_NAV_ITEMS,
  showSocialLinks = false,
}: {
  moreNavItems?: readonly NavigationItem[];
  showSocialLinks?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const activeHref = getActiveHref(pathname);
  const isMoreActive =
    !activeHref && moreNavItems.some(({ url }) => matchesPath(pathname, url));

  const handleNavigate = (key: Key) => router.push(String(key));

  return (
    // `position="static"` and `maxWidth="full"` because the bar sits in flow
    // inside the layout column, which already owns the page measure and gutter.
    <Navbar
      aria-label="Main navigation"
      maxWidth="full"
      navigate={(href) => router.push(href)}
      position="static"
    >
      <Navbar.Header className="gap-4 px-0">
        <Navbar.Brand>
          <Link
            aria-label="MotorMetrics home"
            className="flex size-13 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground"
            href="/"
          >
            <TrendingUp className="size-6" strokeWidth={2.5} />
          </Link>
        </Navbar.Brand>

        {/* Laid out in full the pills wrap onto three rows on a phone and eat
            half the first screen, so below `md` they move into the menu. */}
        <Navbar.Content className="hidden flex-wrap items-center gap-2 md:flex">
          {PRIMARY_NAV_ITEMS.map(({ href, items, label, sectionLabel }) => {
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
                <Dropdown.Popover
                  className="rounded-lg"
                  placement="bottom start"
                >
                  <Dropdown.Menu
                    className={menuClassName(items.length + 1)}
                    onAction={handleNavigate}
                  >
                    <Dropdown.Section
                      className={menuSectionClassName(items.length + 1)}
                    >
                      <Header className={menuHeaderClassName}>
                        {sectionLabel}
                      </Header>
                      {/* Reads "Overview" but announces "Cars overview" — the
                          eyebrow names the group, not the section it links to. */}
                      <Dropdown.Item
                        aria-label={`${label} overview`}
                        className={menuItemClassName}
                        id={href}
                        key={href}
                        textValue={`${label} overview`}
                      >
                        <Label>Overview</Label>
                      </Dropdown.Item>
                      <NavMenuItems items={items} />
                    </Dropdown.Section>
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            );
          })}

          <Dropdown>
            <Button
              className={cn(
                pillClassName(false),
                isMoreActive && "bg-accent-soft-2 font-bold text-accent-deep",
              )}
              variant="tertiary"
            >
              More
              <ChevronDown className="size-4 shrink-0" strokeWidth={2.25} />
            </Button>
            <Dropdown.Popover className="rounded-lg" placement="bottom start">
              <Dropdown.Menu
                className={menuClassName(moreNavItems.length)}
                onAction={handleNavigate}
              >
                <Dropdown.Section
                  className={menuSectionClassName(moreNavItems.length)}
                >
                  <Header className={menuHeaderClassName}>
                    {MORE_NAV_SECTION_LABEL}
                  </Header>
                  <NavMenuItems items={moreNavItems} />
                </Dropdown.Section>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </Navbar.Content>

        <Navbar.Spacer />

        {showSocialLinks ? (
          <Link
            className="hidden rounded-full bg-foreground px-6 py-3.5 font-bold text-accent-foreground text-sm transition-colors hover:bg-muted md:block"
            href={SOCIAL_URLS.telegram}
            rel="noopener noreferrer"
            target="_blank"
          >
            Get updates
          </Link>
        ) : null}

        <Navbar.MenuToggle className="md:hidden" />
      </Navbar.Header>

      <Navbar.Menu className="gap-1">
        {PRIMARY_NAV_ITEMS.map(({ href, items, label, sectionLabel }) => {
          if (!items) {
            return (
              <MobileMenuLink
                href={href}
                isCurrent={href === activeHref}
                key={href}
                label={label}
              />
            );
          }

          // The pill's own dropdown flattens into an eyebrow plus its rows, so
          // the whole tree is reachable without a second level of tapping.
          return (
            <div className="flex flex-col gap-1" key={href}>
              <Header className={menuHeaderClassName}>{sectionLabel}</Header>
              <MobileMenuLink
                href={href}
                isCurrent={href === activeHref}
                label={`${label} overview`}
              />
              {items.map(({ badge, title, url }) => (
                <MobileMenuLink
                  badge={badge}
                  href={url}
                  isCurrent={matchesPath(pathname, url)}
                  key={url}
                  label={title}
                />
              ))}
            </div>
          );
        })}

        <div className="flex flex-col gap-1">
          <Header className={menuHeaderClassName}>
            {MORE_NAV_SECTION_LABEL}
          </Header>
          {moreNavItems.map(({ badge, title, url }) => (
            <MobileMenuLink
              badge={badge}
              href={url}
              isCurrent={matchesPath(pathname, url)}
              key={url}
              label={title}
            />
          ))}
        </div>

        {showSocialLinks ? (
          <Link
            className="mt-4 rounded-full bg-foreground px-6 py-3.5 text-center font-bold text-accent-foreground text-sm transition-colors hover:bg-muted"
            href={SOCIAL_URLS.telegram}
            rel="noopener noreferrer"
            target="_blank"
          >
            Get updates
          </Link>
        ) : null}
      </Navbar.Menu>
    </Navbar>
  );
}
