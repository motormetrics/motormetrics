import { DashboardSectionNav } from "@web/app/(main)/(dashboard)/components/dashboard-section-nav";
import type { ReactNode } from "react";

export default function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <DashboardSectionNav />
      <main className="container mx-auto flex min-h-screen w-full flex-col gap-8 p-6">
        {children}
      </main>
    </>
  );
}
