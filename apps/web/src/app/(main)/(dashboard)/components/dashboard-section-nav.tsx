"use client";

import { cn, ScrollShadow } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { NewChip } from "@web/components/shared/chips";
import {
  type NavigationItem,
  type NavigationSection,
  navigationSections,
} from "@web/config/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

type DashboardSectionNavItem = NavigationItem & {
  sectionName: string;
};

export function DashboardSectionNav() {
  const pathname = usePathname();

  const activeSection =
    navigationSections.find((section) => isSectionActive(pathname, section)) ??
    navigationSections[0];
  const activeSectionItems = activeSection
    ? getSectionItems(activeSection)
    : [];

  return (
    <nav
      aria-label="Dashboard navigation"
      className="border-border/70 border-b bg-background/90 px-4 py-3 backdrop-blur-xl"
    >
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-3">
        <ScrollShadow hideScrollBar orientation="horizontal">
          <div className="flex gap-2">
            {navigationSections.map(({ href, icon: Icon, name }) => {
              const isActive = activeSection?.href === href;

              return (
                <Link
                  key={href}
                  className={cn(
                    buttonVariants({
                      size: "sm",
                      variant: isActive ? "primary" : "outline",
                    }),
                    "h-9 shrink-0 gap-1.5 rounded-full px-4",
                    isActive ? "pointer-events-none" : null,
                  )}
                  aria-current={pathname === href ? "page" : undefined}
                  href={href}
                >
                  <Icon className="size-4" />
                  {name}
                </Link>
              );
            })}
          </div>
        </ScrollShadow>

        {activeSectionItems.length > 1 ? (
          <ScrollShadow hideScrollBar orientation="horizontal">
            <div className="flex gap-2 border-border border-t pt-3">
              {activeSectionItems.map(({ badge, icon: Icon, title, url }) => {
                const isActive = isItemActive(pathname, { title, url });

                return (
                  <Link
                    key={url}
                    className={cn(
                      buttonVariants({
                        size: "sm",
                        variant: isActive ? "secondary" : "tertiary",
                      }),
                      "h-8 shrink-0 gap-1.5 rounded-full px-3",
                      isActive ? "pointer-events-none" : null,
                    )}
                    aria-current={isActive ? "page" : undefined}
                    href={url}
                  >
                    {Icon ? <Icon className="size-3.5" /> : null}
                    {title}
                    {badge ? <NewChip /> : null}
                  </Link>
                );
              })}
            </div>
          </ScrollShadow>
        ) : null}
      </div>
    </nav>
  );
}

const getSectionItems = (
  section: NavigationSection,
): DashboardSectionNavItem[] => {
  if (section.href === "/") {
    return section.children.map((item) => ({
      ...item,
      sectionName: section.name,
    }));
  }

  return [
    {
      title: "Overview",
      url: section.href,
      icon: section.icon,
      sectionName: section.name,
    },
    ...section.children.map((item) => ({ ...item, sectionName: section.name })),
  ];
};

const isItemActive = (pathname: string, item: NavigationItem) => {
  if (item.url === "/") {
    return pathname === "/";
  }

  return item.matchPrefix
    ? pathname.startsWith(item.url)
    : pathname === item.url;
};

const isSectionActive = (pathname: string, section: NavigationSection) => {
  if (section.href === "/") {
    return pathname === "/";
  }

  return pathname === section.href || pathname.startsWith(`${section.href}/`);
};
