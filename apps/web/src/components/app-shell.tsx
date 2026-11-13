"use client";

import { Navbar, Sidebar } from "@heroui-pro/react";
import { LogoMark, Wordmark } from "@web/components/brand-logo";
import { SIDEBAR_GROUPS } from "@web/config/navigation";
import { SOCIAL_URLS } from "@web/config/socials";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";

const matchesPath = (pathname: string, url: string) =>
  url === "/"
    ? pathname === "/"
    : pathname === url || pathname.startsWith(`${url}/`);

// The longest matching url wins, so /cars/makes lights up Makes rather than
// Cars overview as well.
const getCurrentUrl = (pathname: string) =>
  SIDEBAR_GROUPS.flatMap(({ items }) => items)
    .filter(({ url }) => matchesPath(pathname, url))
    .sort((a, b) => b.url.length - a.url.length)[0]?.url;

/**
 * The desktop sidebar sits on the accent ground, so its text, hover and
 * current-row tokens are restated light for that subtree. HeroUI's sidebar
 * parts read these tokens directly, which keeps every part on HeroUI's own
 * classes; the phone sheet is a light surface and keeps the defaults.
 */
const ON_ACCENT_TOKENS = {
  "--foreground": "var(--accent-foreground)",
  "--muted": "color-mix(in oklch, var(--accent-foreground) 72%, transparent)",
  "--default": "color-mix(in oklch, var(--accent-foreground) 14%, transparent)",
  "--separator":
    "color-mix(in oklch, var(--accent-foreground) 24%, transparent)",
} as CSSProperties;

function HomeLink({
  onAccent = false,
  showWordmark,
}: {
  onAccent?: boolean;
  showWordmark: boolean;
}) {
  // The accent half of the mark disappears on the accent ground, so it takes
  // the palest chart step there instead.
  const second = onAccent ? "var(--chart-6)" : "var(--accent)";

  return (
    <Link
      aria-label="MotorMetrics home"
      className="flex shrink-0 items-center gap-2 px-1 py-2 text-foreground no-underline"
      href="/"
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-separator">
        <LogoMark first="currentColor" second={second} size={20} />
      </span>
      {showWordmark ? (
        // data-sidebar="label" hides the wordmark when the sidebar collapses.
        <span data-sidebar="label">
          <Wordmark className="text-lg" first="currentColor" second={second} />
        </span>
      ) : null}
    </Link>
  );
}

/**
 * The sidebar rows, shared by the desktop sidebar and the phone sheet. Rows
 * are tree items rather than anchors, so the footer repeats every link as a
 * plain <a> for crawlers and no-JavaScript visitors.
 */
function SidebarSections({ idPrefix }: { idPrefix: string }) {
  const pathname = usePathname();
  const currentUrl = getCurrentUrl(pathname);

  return SIDEBAR_GROUPS.map(({ items, label }) => (
    <Sidebar.Group key={label}>
      <Sidebar.GroupLabel>{label}</Sidebar.GroupLabel>
      <Sidebar.Menu aria-label={label}>
        {items.map(({ icon: Icon, title, url }) => (
          <Sidebar.MenuItem
            href={url}
            id={`${idPrefix}${url}`}
            isCurrent={url === currentUrl}
            key={url}
            textValue={title}
          >
            {Icon ? (
              <Sidebar.MenuIcon>
                <Icon className="size-4" />
              </Sidebar.MenuIcon>
            ) : null}
            <Sidebar.MenuLabel>{title}</Sidebar.MenuLabel>
          </Sidebar.MenuItem>
        ))}
      </Sidebar.Menu>
    </Sidebar.Group>
  ));
}

function SiteNavbar() {
  return (
    <Navbar aria-label="Page tools" maxWidth="full">
      <Navbar.Header>
        {/* Toggles the rail on desktop and opens the sheet on phones. */}
        <Sidebar.Trigger aria-label="Toggle sections" />
        {/* The sidebar carries the brand on desktop; the phone bar needs its own. */}
        <span className="md:hidden">
          <HomeLink showWordmark={false} />
        </span>
        <Navbar.Spacer />
        <Link
          className="inline-flex h-8.5 shrink-0 items-center whitespace-nowrap rounded-lg bg-foreground px-3 font-medium text-background text-sm transition-opacity hover:opacity-85"
          href={SOCIAL_URLS.telegram}
          rel="me noopener noreferrer nofollow"
          target="_blank"
        >
          Get updates
        </Link>
      </Navbar.Header>
    </Navbar>
  );
}

/**
 * Direction D's shell: a sectioned sidebar on the accent ground, beside the
 * page in a full-width card (HeroUI's inset variant). On phones the card
 * fills the screen and the sections open in a sheet.
 */
export function AppShell({
  announcement,
  children,
}: {
  /** Site-wide notice, on the accent ground above the page card. */
  announcement?: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();

  return (
    <Sidebar.Provider
      className="bg-accent-strong"
      navigate={router.push}
      variant="inset"
    >
      <Sidebar aria-label="Sections" style={ON_ACCENT_TOKENS}>
        <Sidebar.Header>
          <HomeLink onAccent showWordmark />
        </Sidebar.Header>
        <Sidebar.Content>
          <SidebarSections idPrefix="desktop:" />
        </Sidebar.Content>
        <Sidebar.Rail />
      </Sidebar>
      <Sidebar.Mobile>
        <Sidebar.Header>
          <HomeLink showWordmark />
        </Sidebar.Header>
        <Sidebar.Content>
          <SidebarSections idPrefix="mobile:" />
        </Sidebar.Content>
      </Sidebar.Mobile>
      {/* The announcement heads this column rather than the whole window, so
          the sidebar starts at the top and never shifts as the page scrolls. */}
      <div className="flex min-w-0 flex-1 flex-col">
        {announcement}
        {/* overflow-clip rounds the bar into the card's corners without
            making the card a scroll container, which would stop the bar
            sticking to the window. */}
        <Sidebar.Main className="overflow-clip max-md:m-0 max-md:rounded-none max-md:border-0 max-md:shadow-none">
          <SiteNavbar />
          {children}
        </Sidebar.Main>
      </div>
    </Sidebar.Provider>
  );
}
