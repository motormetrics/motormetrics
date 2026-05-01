import { DashboardNav } from "@web/app/(main)/(dashboard)/components/dashboard-nav";
import type { ReactNode } from "react";

const DashboardLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <main className="flex min-h-screen w-full flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <DashboardNav />
      {children}
    </main>
  );
};

export default DashboardLayout;
