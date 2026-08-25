import type { ReactNode } from "react";

// The shell (nav, footer, page padding) lives in (main)/layout.tsx. Editorial
// pages sit in a narrower column than the data dashboards, matching the comps.
export default function SiteLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <div className="mx-auto w-full max-w-[1180px]">{children}</div>;
}
