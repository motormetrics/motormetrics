"use client";

import { Breadcrumbs } from "@heroui/react";
import { Sidebar } from "@heroui-pro/react";
import { LogoMark, Wordmark } from "@web/components/brand-logo";
import { SIDEBAR_GROUPS } from "@web/config/navigation";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, type ReactNode } from "react";

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

const SidebarStoryHeader = ({
  items,
}: {
  items: Array<{
    icon?: ReactNode;
    label: string;
  }>;
}) => (
  <div className="flex items-center gap-4 p-4 md:px-6">
    <Sidebar.Trigger />
    <Breadcrumbs className="min-w-0">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <Breadcrumbs.Item
            key={item.label}
            className={`min-w-0 ${isLast ? "font-semibold" : "text-muted"}`}
          >
            <span className="flex min-w-0 items-center gap-2 overflow-hidden">
              {item.icon}
              <span className="truncate">{item.label}</span>
            </span>
          </Breadcrumbs.Item>
        );
      })}
    </Breadcrumbs>
  </div>
);

/**
 * HeroUI Pro's inset sidebar, following the "Inset Variant" example in the
 * Sidebar docs one for one. The router is passed to the provider so menu
 * items navigate client-side.
 */
export function InsetVariant({
  announcement,
  children,
}: {
  /** Site-wide notice, at the top of the content area under the breadcrumbs. */
  announcement?: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const currentUrl = getCurrentUrl(pathname);
  const currentGroup = SIDEBAR_GROUPS.find(({ items }) =>
    items.some(({ url }) => url === currentUrl),
  );
  const currentItem = currentGroup?.items.find(({ url }) => url === currentUrl);

  // As on motormetrics.app: the mark in a bordered tile, then the wordmark.
  const header = (
    <Link
      aria-label="MotorMetrics home"
      className="flex shrink-0 items-center gap-2 px-1 py-2 text-foreground no-underline"
      href="/"
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-separator">
        <LogoMark first="currentColor" second="var(--accent)" size={20} />
      </span>
      {/* data-sidebar="label" hides the wordmark when the sidebar collapses. */}
      <span data-sidebar="label">
        <Wordmark
          className="text-lg"
          first="currentColor"
          second="var(--accent)"
        />
      </span>
    </Link>
  );

  return (
    <Sidebar.Provider
      collapsible="offcanvas"
      navigate={router.push}
      variant="inset"
    >
      <Sidebar>
        <Sidebar.Header>{header}</Sidebar.Header>
        <Sidebar.Content>
          {SIDEBAR_GROUPS.map(({ items, label }, index) => (
            <Fragment key={label}>
              {index > 0 ? <Sidebar.Separator /> : null}
              <Sidebar.Group>
                <Sidebar.GroupLabel>{label}</Sidebar.GroupLabel>
                <Sidebar.Menu aria-label={label}>
                  {items.map(({ icon: Icon, title, url }) => (
                    <Sidebar.MenuItem
                      href={url}
                      id={url}
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
            </Fragment>
          ))}
        </Sidebar.Content>
      </Sidebar>
      <Sidebar.Mobile>
        <Sidebar.Header>{header}</Sidebar.Header>
        <Sidebar.Content>
          {SIDEBAR_GROUPS.map(({ items, label }, index) => (
            <Fragment key={label}>
              {index > 0 ? <Sidebar.Separator /> : null}
              <Sidebar.Group>
                <Sidebar.GroupLabel>{label}</Sidebar.GroupLabel>
                <Sidebar.Menu aria-label={label}>
                  {items.map(({ icon: Icon, title, url }) => (
                    <Sidebar.MenuItem
                      href={url}
                      id={`${url}-mobile-inset`}
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
            </Fragment>
          ))}
        </Sidebar.Content>
      </Sidebar.Mobile>
      <Sidebar.Main className="bg-background">
        <SidebarStoryHeader
          items={
            currentItem && currentGroup
              ? [{ label: currentGroup.label }, { label: currentItem.title }]
              : []
          }
        />
        <div className="grid gap-4 p-4 pt-0 md:px-6 md:pb-6">
          {announcement}
          {children}
        </div>
      </Sidebar.Main>
    </Sidebar.Provider>
  );
}
