"use client";

import { Breadcrumbs } from "@heroui/react";
import { Sidebar } from "@heroui-pro/react";
import { LogoMark } from "@web/components/brand-logo";
import { SIDEBAR_GROUPS } from "@web/config/navigation";
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
  <div className="flex items-center gap-3 p-4">
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
  /** Site-wide notice, at the top of the content area. */
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

  const header = (
    <div className="flex items-center gap-3 px-1 py-2">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground">
        <LogoMark
          className="text-background"
          first="currentColor"
          second="currentColor"
          size={16}
        />
      </div>
      <div className="flex flex-col">
        <span className="font-semibold text-foreground text-sm leading-tight">
          MotorMetrics
        </span>
        <span className="text-muted text-xs leading-tight">
          Singapore car market
        </span>
      </div>
    </div>
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
      <Sidebar.Main>
        {announcement}
        <SidebarStoryHeader
          items={
            currentItem && currentGroup
              ? [{ label: currentGroup.label }, { label: currentItem.title }]
              : []
          }
        />
        <div className="grid gap-4 p-4 pt-0">{children}</div>
      </Sidebar.Main>
    </Sidebar.Provider>
  );
}
