import { Announcement } from "@web/components/announcement";
import { AppNav } from "@web/components/app-nav";
import { Banner } from "@web/components/banner";
import { Footer } from "@web/components/footer";
import { NotificationPrompt } from "@web/components/notification-prompt";
import { SurveyPrompt } from "@web/components/survey-prompt";
import { footerNavItems, moreNavItems } from "@web/utils/flagged-nav";
import type { ReactNode } from "react";

// advertise-nav and blog-nav previously gated these items per request via
// the Flags SDK, which reads request headers and pulled every page out of
// the static shell. The flags provider work is parked (#1019), so this
// renders the declared defaultValue (false) statically instead.
const moreItems = moreNavItems({ advertise: false, blog: false });
const footerItems = footerNavItems({ advertise: false });

export default function MainLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <NotificationPrompt />
      <SurveyPrompt />
      <Announcement />
      <Banner />

      {/*
        Every page draws the same column — `max-w-page`, defined once in
        `globals.css`. The nav and footer sit inside it, so they line up with
        the content beneath them, and the two bars above use the same measure.
      */}
      <div className="mx-auto flex min-h-screen w-full max-w-page flex-col gap-8 px-4 py-8 sm:px-6 lg:px-9 lg:py-9">
        <AppNav moreNavItems={moreItems} />
        <main className="flex flex-1 flex-col gap-8">{children}</main>
        <Footer navItems={footerItems} />
      </div>
    </div>
  );
}
