import { Footer } from "@web/components/footer";
import type { ReactNode } from "react";

export default function SiteLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </>
  );
}
