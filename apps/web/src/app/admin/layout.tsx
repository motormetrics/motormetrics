import { Toaster } from "@motormetrics/ui/components/sonner";
import type { ReactNode } from "react";

export default function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
