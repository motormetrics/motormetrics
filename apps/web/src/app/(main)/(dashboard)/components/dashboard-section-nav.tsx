"use client";

import { ScrollShadow } from "@heroui/react";
import { Segment } from "@heroui-pro/react";
import { NewChip } from "@web/components/shared/chips";
import {
  type NavigationItem,
  type NavigationSection,
  navigationSections,
} from "@web/config/navigation";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";

type DashboardSectionNavItem = NavigationItem & {
  sectionName: string;
};

export function DashboardSectionNav() {
  const pathname = usePathname();
  const router = useRouter();

  const activeSection =
    navigationSections.find((section) => isSectionActive(pathname, section)) ??
    navigationSections[0];
  const activeSectionItems = activeSection
    ? getSectionItems(activeSection)
    : [];
  const activeItem = activeSectionItems.find((item) =>
    isItemActive(pathname, item),
  );

  const handleSectionChange = (key: React.Key) => {
    const section = navigationSections.find((item) => item.href === key);

    if (!section || section.href === pathname) {
      return;
    }

    router.push(section.href);
  };

  const handleSectionItemChange = (key: React.Key) => {
    const item = activeSectionItems.find(
      (sectionItem) => sectionItem.url === key,
    );

    if (!item || item.url === pathname) {
      return;
    }

    router.push(item.url);
  };

  return (
    <div className="container mx-auto flex flex-col gap-2 p-6">
      <ScrollShadow hideScrollBar orientation="horizontal">
        <Segment
          aria-label="Dashboard sections"
          selectedKey={activeSection?.href ?? "/"}
          variant="ghost"
          onSelectionChange={handleSectionChange}
        >
          {navigationSections.map(({ href, icon: Icon, name }) => {
            return (
              <Segment.Item key={href} id={href}>
                <Icon className="size-4" />
                {name}
              </Segment.Item>
            );
          })}
        </Segment>
      </ScrollShadow>

      {activeSectionItems.length > 1 && (
        <ScrollShadow hideScrollBar orientation="horizontal">
          <Segment
            aria-label={`${activeSection?.name ?? "Dashboard"} navigation`}
            selectedKey={activeItem?.url ?? activeSection?.href ?? "/"}
            variant="ghost"
            onSelectionChange={handleSectionItemChange}
          >
            {activeSectionItems.map(({ badge, icon: Icon, title, url }) => {
              return (
                <Segment.Item key={url} id={url}>
                  {Icon && <Icon className="size-3.5" />}
                  {title}
                  {badge && <NewChip />}
                </Segment.Item>
              );
            })}
          </Segment>
        </ScrollShadow>
      )}
    </div>
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
