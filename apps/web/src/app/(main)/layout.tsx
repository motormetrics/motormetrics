import { Announcement } from "@web/components/announcement";
import { Banner } from "@web/components/banner";
import { Header } from "@web/components/header";
import { NotificationPrompt } from "@web/components/notification-prompt";
import type { ReactNode } from "react";

export default function MainLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <NotificationPrompt />
      <Announcement />
      <Header />
      <Banner />
      {children}
    </>
  );
}
