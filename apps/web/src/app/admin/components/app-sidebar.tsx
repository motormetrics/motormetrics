"use client";

import { Button, ScrollShadow } from "@heroui/react";
import { authClient } from "@web/app/admin/lib/auth-client";
import {
  Activity,
  BarChart3,
  Car,
  Database,
  DollarSign,
  Edit3,
  FileText,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Users,
  Workflow,
  Wrench,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

function isRouteActive(pathname: string, url: string) {
  return pathname === url || (url !== "/admin" && pathname.startsWith(url));
}

const data = {
  navigation: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Data Management",
      icon: Database,
      items: [
        {
          title: "Car Registrations",
          url: "/admin/data/cars",
          icon: Car,
        },
        {
          title: "COE Results",
          url: "/admin/data/coe",
          icon: DollarSign,
        },
      ],
    },
    {
      title: "Content Management",
      icon: Edit3,
      items: [
        {
          title: "Blog",
          url: "/admin/content/blog",
          icon: FileText,
        },
        {
          title: "Announcements",
          url: "/admin/content/announcements",
          icon: MessageSquare,
        },
      ],
    },
    {
      title: "Workflows",
      url: "/admin/workflows",
      icon: Workflow,
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: BarChart3,
    },
    {
      title: "System Health",
      url: "/admin/health",
      icon: Activity,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: Users,
    },
    {
      title: "Logs",
      url: "/admin/logs",
      icon: FileText,
    },
    {
      title: "Settings",
      icon: Settings,
      items: [
        {
          title: "General",
          url: "/admin/settings",
          icon: Settings,
        },
        {
          title: "Maintenance",
          url: "/admin/settings/maintenance",
          icon: Wrench,
        },
      ],
    },
  ],
};

export const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Signed out successfully");
          router.push("/admin/login");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "Failed to sign out");
        },
      },
    });
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r bg-background lg:flex">
      <div className="flex items-center gap-2 border-b px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary">
          <LayoutDashboard className="size-4 text-primary-foreground" />
        </div>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">MotorMetrics Admin</span>
          <span className="truncate text-muted text-xs">
            {session?.user?.email || "Dashboard"}
          </span>
        </div>
      </div>

      <ScrollShadow className="flex-1 px-3 py-4">
        <div className="mb-2 px-3 font-medium text-muted text-xs uppercase tracking-wide">
          Navigation
        </div>
        <nav className="flex flex-col gap-1">
          {data.navigation.map((item) => {
            if (item.items) {
              return (
                <div key={item.title} className="flex flex-col gap-1">
                  <div className="flex items-center gap-2 px-3 py-2 font-medium text-muted text-sm">
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </div>
                  <div className="ml-5 flex flex-col gap-1 border-l pl-3">
                    {item.items.map((subItem) => {
                      const isActive = isRouteActive(pathname, subItem.url);

                      return (
                        <Link
                          key={subItem.title}
                          href={subItem.url as Route}
                          className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted hover:bg-surface-secondary hover:text-foreground"
                          }`}
                        >
                          <subItem.icon className="size-4" />
                          <span>{subItem.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }

            const isActive = isRouteActive(pathname, item.url);

            return (
              <Link
                key={item.title}
                href={item.url as Route}
                className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted hover:bg-surface-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="size-4" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollShadow>

      <div className="border-t p-3">
        <Button fullWidth variant="ghost" onPress={handleSignOut}>
          <LogOut className="size-4" />
          Sign Out
        </Button>
      </div>
    </aside>
  );
};
