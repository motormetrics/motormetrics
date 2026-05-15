import { Announcement } from "@web/components/announcement";
import { AppNavbar } from "@web/components/app-navbar";
import { Banner } from "@web/components/banner";
import { NotificationPrompt } from "@web/components/notification-prompt";
import type { ReactNode } from "react";

export default function MainLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <NotificationPrompt />
      <Announcement />
      <AppNavbar />
      <Banner />
      {/* TODO(sgcarstrends-9h9): Revisit nested route layouts and container responsibilities. */}
      {children}
    </>
  );
}
