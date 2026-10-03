"use client";

import type { Key } from "@heroui/react";
import { Button, cn, Dropdown, Header, Label, Separator } from "@heroui/react";
import { Navbar } from "@heroui-pro/react";
import { LogoMark, Wordmark } from "@web/components/brand-logo";
import { NavBadge } from "@web/components/shared/chips";
import {
  MORE_NAV_ITEMS,
  MORE_NAV_SECTION_LABEL,
  type NavigationItem,
  PRIMARY_NAV_ITEMS,
} from "@web/config/navigation";
import { SOCIAL_URLS } from "@web/config/socials";
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment } from "react";

const matchesPath = (pathname: string, href: string) => {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
};

// The longest matching href wins, so a nested pill would never also light up
// the section it sits under.
const getActiveHref = (pathname: string) =>
  PRIMARY_NAV_ITEMS.filter(({ href }) => matchesPath(pathname, href)).sort(
    (a, b) => b.href.length - a.href.length,
  )[0]?.href;

// MMNav text links: muted 14px labels, with the current one underlined in the
// accent. They stretch to the bar's full height and `-mb-px` drops the
// underline onto the bar's hairline rather than just above it.
const linkClassName = (isActive: boolean) =>
  cn(
    "-mb-px flex h-auto min-w-0 items-center gap-1.25 whitespace-nowrap rounded-none border-transparent border-b-2 bg-transparent px-0 font-medium text-sm transition-colors hover:bg-transparent hover:text-foreground data-[hovered=true]:bg-transparent data-[pressed=true]:bg-transparent",
    isActive ? "border-accent font-semibold text-foreground" : "text-muted",
  );

// Menu chrome from the MMNav comp: rows are 4px-radius 14px labels rather
// than the 32px HeroUI default.
const menuItemClassName =
  "rounded-sm px-3.5 py-2.25 font-medium text-muted-strong text-sm";

// Section labels are plain 11.5px uppercase eyebrows. The hairline Separator
// between sections marks the break, so the eyebrow needs no tint of its own.
// The phone sheet shares this class.
const menuHeaderClassName =
  "col-span-full px-3.5 pt-2 pb-1 font-semibold text-[11.5px] text-subtle uppercase tracking-[0.06em]";

// Spans the menu's columns so it rules across the whole popover.
const menuSeparatorClassName = "col-span-full mx-1 my-1.5 w-auto";

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
        <NavBadge badge={badge} />
      </Label>
    </Dropdown.Item>
  ));
}

/**
 * One row of the phone sheet. Pressing it closes the menu on its own. Rows are
 * 15px with a 4px radius, and the current one takes the accent tint, per the
 * MMNav comp. A long label wraps rather than pushing its column wider.
 */
function MobileMenuLink({
  ariaLabel,
  badge,
  href,
  isCurrent,
  label,
}: {
  ariaLabel?: string;
  badge?: NavigationItem["badge"];
  href: string;
  isCurrent: boolean;
  label: string;
}) {
  return (
    <Navbar.MenuItem
      aria-label={ariaLabel}
      className="flex min-w-0 items-center gap-2 rounded-sm px-3.5 py-2.75 font-medium text-[15px] text-muted-strong data-[current=true]:bg-accent-soft data-[current=true]:font-semibold data-[current=true]:text-accent"
      href={href}
      isCurrent={isCurrent}
    >
      <span className="min-w-0">{label}</span>
      <NavBadge badge={badge} />
    </Navbar.MenuItem>
  );
}

/** The Telegram call to action, in the bar at every width. */
function GetUpdatesLink() {
  return (
    <Link
      className="inline-flex h-8.5 shrink-0 items-center whitespace-nowrap rounded-lg bg-foreground px-3 font-medium text-[13.5px] text-background transition-opacity hover:opacity-85"
      href={SOCIAL_URLS.telegram}
      rel="noopener noreferrer"
      target="_blank"
    >
      Get updates
    </Link>
  );
}

export function AppNav({
  moreNavItems = MORE_NAV_ITEMS,
}: {
  moreNavItems?: readonly NavigationItem[];
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
    // The bar is 60px (56px on phones) over a hairline, per the MMNav comp.
    <Navbar
      aria-label="Main navigation"
      className="@container border-separator border-b [--navbar-height:3.5rem] md:[--navbar-height:3.75rem]"
      maxWidth="full"
      navigate={(href) => router.push(href)}
      position="static"
    >
      {/* The header is the query container: it is w-full in the Pro CSS, so
          its width tracks the layout column rather than its own content.
          Once collapsed, the gap drops to 12px so the brand, CTA and toggle
          fit a 360px phone, per the MMNav comp. An element cannot query
          itself, so that gap reads the root, which is also @container and
          exactly as wide. */}
      <Navbar.Header className="@container @max-4xl:gap-3 gap-5 px-0 min-[1101px]:gap-8">
        <Navbar.Brand>
          <Link
            aria-label="MotorMetrics home"
            className="flex shrink-0 items-center gap-2.25 text-foreground no-underline"
            href="/"
          >
            <span className="flex size-7.5 shrink-0 items-center justify-center rounded-lg border border-separator">
              <LogoMark first="currentColor" second="var(--accent)" size={22} />
            </span>
            <Wordmark
              className="text-[19px] md:text-[21px]"
              first="currentColor"
              second="var(--accent)"
            />
          </Link>
        </Navbar.Brand>

        {/* The full row needs about 840px, so below a 56rem header (@4xl) the
            links move into the menu. */}
        <Navbar.Content className="@4xl:flex hidden @4xl:items-stretch gap-4 self-stretch min-[1101px]:gap-6">
          {PRIMARY_NAV_ITEMS.map(({ href, label, sections }) => {
            const isActive = href === activeHref;

            if (!sections) {
              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={linkClassName(isActive)}
                  href={href}
                  key={href}
                >
                  {label}
                </Link>
              );
            }

            // Every group shares the menu's columns, so the column count comes
            // from the rows across all of them, Overview included.
            const rowCount = sections.reduce(
              (count, section) =>
                count + section.items.length + (section.withOverview ? 1 : 0),
              0,
            );

            return (
              <Dropdown key={href}>
                <Button
                  aria-current={isActive ? "true" : undefined}
                  className={linkClassName(isActive)}
                  variant="tertiary"
                >
                  {label}
                  <ChevronDown
                    className="size-3.5 shrink-0"
                    strokeWidth={2.25}
                  />
                </Button>
                <Dropdown.Popover
                  className="rounded-xl border border-separator"
                  placement="bottom start"
                >
                  <Dropdown.Menu
                    className={menuClassName(rowCount)}
                    onAction={handleNavigate}
                  >
                    {sections.map((section, index) => (
                      <Fragment key={section.label}>
                        {index > 0 ? (
                          <Separator className={menuSeparatorClassName} />
                        ) : null}
                        <Dropdown.Section
                          className={menuSectionClassName(rowCount)}
                        >
                          <Header className={menuHeaderClassName}>
                            {section.label}
                          </Header>
                          {/* Reads "Overview" but announces "Cars overview" — the
                            eyebrow names the group, not the section it links to. */}
                          {section.withOverview ? (
                            <Dropdown.Item
                              aria-label={`${label} overview`}
                              className={menuItemClassName}
                              id={href}
                              key={href}
                              textValue={`${label} overview`}
                            >
                              <Label>Overview</Label>
                            </Dropdown.Item>
                          ) : null}
                          <NavMenuItems items={section.items} />
                        </Dropdown.Section>
                      </Fragment>
                    ))}
                  </Dropdown.Menu>
                </Dropdown.Popover>
              </Dropdown>
            );
          })}

          <Dropdown>
            <Button
              aria-current={isMoreActive ? "true" : undefined}
              className={linkClassName(isMoreActive)}
              variant="tertiary"
            >
              More
              <ChevronDown className="size-3.5 shrink-0" strokeWidth={2.25} />
            </Button>
            <Dropdown.Popover
              className="rounded-xl border border-separator"
              placement="bottom start"
            >
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

        <GetUpdatesLink />

        {/* A 34px bordered square, matching the CTA's height. */}
        <Navbar.MenuToggle className="@4xl:hidden size-8.5 shrink-0 rounded-lg border border-border" />
      </Navbar.Header>

      {/* The phone sheet: an Explore group of the primary links, then every
          dropdown group and Company, each ruled off by a hairline. Rows run in
          two columns, and the eyebrows and rules span both. HeroUI keeps the
          full-height panel and the scroll lock. */}
      <Navbar.Menu className="grid grid-cols-2 content-start gap-x-2 gap-y-0.5 px-0 pt-2">
        <Header className={menuHeaderClassName}>Explore</Header>
        {PRIMARY_NAV_ITEMS.map(({ href, label }) => (
          <MobileMenuLink
            href={href}
            isCurrent={href === activeHref}
            key={href}
            label={label}
          />
        ))}

        {PRIMARY_NAV_ITEMS.flatMap(({ href, label, sections = [] }) =>
          sections.map((section) => (
            <Fragment key={section.label}>
              <Separator className={menuSeparatorClassName} />
              <Header className={menuHeaderClassName}>{section.label}</Header>
              {/* Explore already marks the section, so this row is current only
                  on the section's own page. */}
              {section.withOverview ? (
                <MobileMenuLink
                  ariaLabel={`${label} overview`}
                  href={href}
                  isCurrent={pathname === href}
                  label="Overview"
                />
              ) : null}
              {section.items.map(({ badge, title, url }) => (
                <MobileMenuLink
                  badge={badge}
                  href={url}
                  isCurrent={matchesPath(pathname, url)}
                  key={url}
                  label={title}
                />
              ))}
            </Fragment>
          )),
        )}

        <Separator className={menuSeparatorClassName} />
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
      </Navbar.Menu>
    </Navbar>
  );
}
