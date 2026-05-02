"use client";

import type { Key } from "@heroui/react";

import { Button, cn, Dropdown, Label, ScrollShadow } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { Segment } from "@heroui-pro/react";
import { NewChip } from "@web/components/shared/chips";
import {
  type NavigationItem,
  type NavigationSection,
  navigationSections,
} from "@web/config/navigation";
import { Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type DashboardNavItem = NavigationItem & {
  sectionName: string;
};

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();

  const activeSection =
    navigationSections.find((section) => isSectionActive(pathname, section)) ??
    navigationSections[0];
  const activeSectionItems = activeSection
    ? getSectionItems(activeSection)
    : [];
  const activeItem =
    activeSectionItems.find((item) => isItemActive(pathname, item)) ??
    activeSectionItems[0];
  const hasSectionPages = activeSection
    ? getSectionPages(activeSection).length > 0
    : false;

  const handleNavigate = (key: Key) => {
    router.push(String(key));
  };

  return (
    <nav
      aria-label="Dashboard navigation"
      className="border-separator/70 border-b bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto flex w-full max-w-full flex-col gap-3 py-3 md:flex-row md:items-center md:gap-2 md:py-2">
        <div className="hidden md:flex">
          <Segment
            selectedKey={activeSection?.href}
            size="sm"
            onSelectionChange={handleNavigate}
          >
            {navigationSections.map(({ href, icon: Icon, name }) => (
              <Segment.Item key={href} id={href}>
                <Segment.Separator />
                <Icon className="size-4" />
                <span>{name}</span>
              </Segment.Item>
            ))}
          </Segment>
        </div>

        <ScrollShadow
          className="-mx-4 md:hidden"
          hideScrollBar
          orientation="horizontal"
        >
          <div className="flex gap-2 px-4">
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
                    "h-8 shrink-0 gap-1.5 rounded-full px-3",
                    isActive ? "pointer-events-none" : null,
                  )}
                  href={href}
                >
                  <Icon className="size-4" />
                  {name}
                </Link>
              );
            })}
          </div>
        </ScrollShadow>

        {hasSectionPages && activeItem ? (
          <Dropdown>
            <Button
              className="h-9 w-full justify-between gap-2 rounded-full px-3 md:h-8 md:w-auto md:justify-center md:gap-1.5"
              variant="outline"
            >
              <span className="flex min-w-0 items-center gap-1.5">
                {activeItem.icon ? (
                  <activeItem.icon className="size-4 shrink-0" />
                ) : null}
                <span className="truncate md:max-w-48">{activeItem.title}</span>
              </span>
              <ChevronDown className="size-3.5 shrink-0 text-muted" />
            </Button>
            <Dropdown.Popover className="min-w-70" placement="bottom start">
              <Dropdown.Menu onAction={handleNavigate}>
                {activeSectionItems.map(
                  ({ badge, icon: ItemIcon, title, url }) => (
                    <Dropdown.Item key={url} id={url} textValue={title}>
                      {ItemIcon ? (
                        <ItemIcon className="size-4 shrink-0 text-muted" />
                      ) : null}
                      <Label className="flex min-w-0 flex-1 items-center gap-2">
                        <span className="truncate">{title}</span>
                        {badge ? <NewChip /> : null}
                      </Label>
                      {isItemActive(pathname, { title, url }) ? (
                        <Check className="ms-auto size-4 shrink-0 text-accent" />
                      ) : null}
                    </Dropdown.Item>
                  ),
                )}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        ) : null}
      </div>
    </nav>
  );
}

const getSectionItems = (section: NavigationSection): DashboardNavItem[] => {
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

const getSectionPages = (section: NavigationSection) =>
  getSectionItems(section).filter((item) => item.url !== section.href);

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
