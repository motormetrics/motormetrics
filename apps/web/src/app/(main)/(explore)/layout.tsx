import { DashboardNav } from "@web/app/(main)/(explore)/components/dashboard-nav";
import type { ReactNode } from "react";

const DashboardLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <main className="container mx-auto flex min-h-screen flex-col gap-8 px-6 py-8">
      <DashboardNav />
      {children}
    </main>
  );
};

export default DashboardLayout;
