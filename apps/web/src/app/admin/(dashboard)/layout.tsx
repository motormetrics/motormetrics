import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@motormetrics/ui/components/sidebar";
import { AppSidebar } from "@web/app/admin/components/app-sidebar";
import { type ReactNode, Suspense } from "react";

export default function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <SidebarProvider>
      <Suspense>
        <AppSidebar />
      </Suspense>
      <SidebarInset>
        <header className="sticky top-0 z-10 border-b bg-background px-6 py-4">
          <SidebarTrigger />
        </header>
        <main className="p-6">
          <Suspense>{children}</Suspense>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
