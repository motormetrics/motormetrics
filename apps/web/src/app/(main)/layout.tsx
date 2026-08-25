import { Announcement } from "@web/components/announcement";
import { AppNav } from "@web/components/app-nav";
import { Banner } from "@web/components/banner";
import { Footer } from "@web/components/footer";
import { NotificationPrompt } from "@web/components/notification-prompt";
import type { ReactNode } from "react";

export default function MainLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    // The Overview v2 skin is token overrides only (see globals.css), so every
    // route inside this group picks it up through the standard utilities.
    // Remove data-skin to put the whole site back on the global navy theme.
    <div
      className="min-h-screen bg-background text-foreground"
      data-skin="overview-v2"
    >
      <NotificationPrompt />
      <Announcement />
      <Banner />

      <div className="mx-auto flex min-h-screen w-full max-w-[1560px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-9 lg:py-9">
        <AppNav />
        <main className="flex flex-1 flex-col gap-8">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
