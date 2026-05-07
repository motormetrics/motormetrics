import { DashboardNav } from "@web/app/(main)/(dashboard)/components/dashboard-nav";
import type { ReactNode } from "react";

export default function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-screen-2xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">
      <DashboardNav />
      {children}
    </main>
  );
}
