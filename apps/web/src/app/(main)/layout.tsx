import { Announcement } from "@web/components/announcement";
import { Footer } from "@web/components/footer";
import { InsetVariant } from "@web/components/inset-variant";
import { NotificationPrompt } from "@web/components/notification-prompt";
import { SurveyPrompt } from "@web/components/survey-prompt";
import type { ReactNode } from "react";

export default function MainLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-screen text-foreground">
      <NotificationPrompt />
      <SurveyPrompt />

      {/*
        The page runs the full width of the card beside the sidebar; there is
        no max width. Sidebar.Main renders the <main> element itself.
      */}
      <InsetVariant announcement={<Announcement />}>
        {children}
        <Footer />
      </InsetVariant>
    </div>
  );
}
