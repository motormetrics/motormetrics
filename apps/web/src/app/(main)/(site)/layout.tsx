import { Footer } from "@web/components/footer";
import type { ReactNode } from "react";

export default function SiteLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        {children}
      </main>
      <Footer />
    </>
  );
}
