import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function PreviewLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <main className="container mx-auto px-6 py-8">{children}</main>;
}
