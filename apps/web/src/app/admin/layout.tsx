import type { ReactNode } from "react";
import { Toaster } from "sonner";

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
