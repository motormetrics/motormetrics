import { Announcement } from "@web/components/announcement";
import { AppShell } from "@web/components/app-shell";
import { Footer } from "@web/components/footer";
import { NotificationPrompt } from "@web/components/notification-prompt";
import { SurveyPrompt } from "@web/components/survey-prompt";
import type { ReactNode } from "react";

export default function MainLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-screen bg-accent-strong text-foreground">
      <NotificationPrompt />
      <SurveyPrompt />

      {/*
        The page runs the full width of the card beside the sidebar; there is
        no max width. Sidebar.Main renders the <main> element itself.
      */}
      <AppShell announcement={<Announcement />}>
        <div className="flex min-h-full flex-col gap-8 px-4 pt-6 pb-8 sm:px-6 lg:px-9 lg:pb-9">
          {children}
          <Footer />
        </div>
      </AppShell>
    </div>
  );
}
