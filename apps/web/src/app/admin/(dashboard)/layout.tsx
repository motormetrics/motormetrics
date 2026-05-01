import { AppSidebar } from "@web/app/admin/components/app-sidebar";
import { type ReactNode, Suspense } from "react";

export default function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-screen lg:flex">
      <Suspense>
        <AppSidebar />
      </Suspense>
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-10 border-b bg-background px-6 py-4 lg:hidden">
          <span className="font-semibold">MotorMetrics Admin</span>
        </header>
        <main className="container mx-auto p-6">
          <Suspense>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}
