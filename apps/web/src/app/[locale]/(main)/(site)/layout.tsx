import { Footer } from "@web/components/footer";
import type { ReactNode } from "react";

export default function SiteLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <main className="container mx-auto px-6 py-8">{children}</main>
      <Footer />
    </>
  );
}
