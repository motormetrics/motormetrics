"use client";

import { Typography } from "@heroui/react";
import { Sidebar } from "@heroui-pro/react";
import {
  LogoMark,
  MARK_ACCENT_ON_DARK,
  Wordmark,
} from "@web/components/brand-logo";
import { SIDEBAR_GROUPS } from "@web/config/navigation";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

const matchesPath = (pathname: string, url: string) =>
  url === "/"
    ? pathname === "/"
    : pathname === url || pathname.startsWith(`${url}/`);

// The longest matching url wins, so /cars/makes lights up Makes rather than
// New registrations (/cars) as well.
const getCurrentUrl = (pathname: string) =>
  SIDEBAR_GROUPS.flatMap(({ items }) => items)
    .filter(({ url }) => matchesPath(pathname, url))
    .sort((a, b) => b.url.length - a.url.length)[0]?.url;

/** The bars and the wordmark in white, as the brand sheet sets them on deep blue. */
function Brand() {
  return (
    <Link
      aria-label="MotorMetrics home"
      className="flex shrink-0 items-center gap-2 px-1 py-2 no-underline"
      href="/"
    >
      <LogoMark inner={MARK_ACCENT_ON_DARK} outer="#FFFFFF" size={26} />
      <Wordmark className="text-lg" colour="#FFFFFF" />
    </Link>
  );
}

/**
 * The groups, written once and rendered twice: `Sidebar` on desktop and
 * `Sidebar.Mobile` on phones. `idSuffix` keeps the two trees' row ids apart.
 */
function Groups({
  currentUrl,
  idSuffix = "",
}: {
  currentUrl?: string;
  idSuffix?: string;
}) {
  return SIDEBAR_GROUPS.map(({ icon: Icon, items, label }) => {
    const isSolo = items.length === 1;

    return (
      <Sidebar.Group key={label}>
        {isSolo ? null : (
          <Sidebar.GroupLabel className="flex items-center gap-2 uppercase">
            <Icon aria-hidden="true" className="size-4" />
            {label}
          </Sidebar.GroupLabel>
        )}
        <Sidebar.Menu aria-label={label}>
          {items.map(({ title, url }) => (
            <Sidebar.MenuItem
              href={url}
              id={`${url}${idSuffix}`}
              isCurrent={url === currentUrl}
              key={url}
              textValue={title}
            >
              {isSolo ? (
                <Sidebar.MenuIcon>
                  <Icon className="size-4" />
                </Sidebar.MenuIcon>
              ) : null}
              {/* Rows under a label line up with the label's text, past its icon. */}
              <Sidebar.MenuLabel className={isSolo ? undefined : "ps-6"}>
                {title}
              </Sidebar.MenuLabel>
            </Sidebar.MenuItem>
          ))}
        </Sidebar.Menu>
      </Sidebar.Group>
    );
  });
}

function Source() {
  return (
    <Typography.Paragraph
      className="border-separator border-t px-2 pt-4"
      color="muted"
      size="xs"
    >
      Data from LTA via DataMall.
    </Typography.Paragraph>
  );
}

/**
 * HeroUI Pro's inset sidebar: a Deep Blue band around the page's card, the
 * same in both themes (the band's colours are set in globals.css, as the
 * sidebar has no colour tokens of its own). The router is passed to the
 * provider so menu items navigate client-side.
 */
export function InsetVariant({
  announcement,
  children,
}: {
  /** Site-wide notice, at the top of the content area. */
  announcement?: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const currentUrl = getCurrentUrl(pathname);

  return (
    <Sidebar.Provider
      collapsible="offcanvas"
      navigate={router.push}
      variant="inset"
    >
      <Sidebar>
        <Sidebar.Header>
          <Brand />
        </Sidebar.Header>
        <Sidebar.Content>
          <Groups currentUrl={currentUrl} />
        </Sidebar.Content>
        <Sidebar.Footer>
          <Source />
        </Sidebar.Footer>
      </Sidebar>
      <Sidebar.Mobile>
        <Sidebar.Header>
          <Brand />
        </Sidebar.Header>
        <Sidebar.Content>
          <Groups currentUrl={currentUrl} idSuffix="-mobile" />
        </Sidebar.Content>
        <Sidebar.Footer>
          <Source />
        </Sidebar.Footer>
      </Sidebar.Mobile>
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Phones: the band becomes a strip with the logo and the menu button. */}
        <div className="shell-band flex items-center justify-between px-4 py-2 md:hidden">
          <Brand />
          <Sidebar.Trigger />
        </div>
        <Sidebar.Main>
          <div className="px-4 pt-4 max-md:hidden md:px-10">
            <Sidebar.Trigger />
          </div>
          <div className="grid gap-4 p-4 md:px-10 md:pb-10">
            {announcement}
            {children}
          </div>
        </Sidebar.Main>
      </div>
    </Sidebar.Provider>
  );
}
