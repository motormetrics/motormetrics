import { DashboardNav } from "@web/app/(main)/(dashboard)/components/dashboard-nav";
import type { ReactNode } from "react";

export default function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <main className="container mx-auto flex min-h-screen flex-col gap-8 px-6 py-8">
      <DashboardNav />
      {children}
    </main>
  );
}
