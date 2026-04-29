"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@motormetrics/ui/components/sidebar";
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
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
            <LayoutDashboard className="size-4 text-primary-foreground" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">MotorMetrics Admin</span>
            <span className="truncate text-muted-foreground text-xs">
              {session?.user?.email || "Dashboard"}
            </span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {data.navigation.map((item) => {
                if (item.items) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton>
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                      <SidebarMenu className="ml-6">
                        {item.items.map((subItem) => {
                          const isActive = pathname === subItem.url;
                          return (
                            <SidebarMenuItem key={subItem.title}>
                              <SidebarMenuButton asChild isActive={isActive}>
                                <Link href={subItem.url as Route}>
                                  <subItem.icon />
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuButton>
                            </SidebarMenuItem>
                          );
                        })}
                      </SidebarMenu>
                    </SidebarMenuItem>
                  );
                }

                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.url as Route}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut}>
              <LogOut />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
};
