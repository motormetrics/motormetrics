"use client";

import { Button } from "@heroui/button";
import { cn } from "@heroui/theme";
import { NewChip } from "@web/components/shared/chips";
import { navigationSections } from "@web/config/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function DashboardNav() {
  const pathname = usePathname();

  // Find active item across all sections
  const findActiveKey = () => {
    for (const section of navigationSections) {
      for (const item of section.children) {
        const matches = item.matchPrefix
          ? pathname.startsWith(item.url)
          : pathname === item.url;
        if (matches) return item.url;
      }
    }
    return pathname;
  };

  const activeKey = findActiveKey();

  return (
    <nav className="flex max-w-full items-center gap-2 overflow-x-auto">
      {navigationSections.map((section) => (
        <div key={section.name} className="flex shrink-0 items-center gap-2">
          {section.children.map(({ title, url, icon: Icon, badge }) => {
            const isActive = activeKey === url;
            return (
              <Button
                key={url}
                as={Link}
                href={url}
                className={cn(
                  "h-8 shrink-0 rounded-full px-3 font-medium text-sm transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-transparent text-default-600 hover:bg-default-100",
                )}
                startContent={Icon && <Icon className="size-4" />}
                endContent={badge && <NewChip />}
              >
                {title}
              </Button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
