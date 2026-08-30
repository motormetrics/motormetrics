import { AppNav } from "@web/components/app-nav";
import { Footer } from "@web/components/footer";
import { getChromeFlags } from "@web/lib/chrome-flags";
import { footerNavItems, moreNavItems } from "@web/utils/flagged-nav";

export async function FlaggedAppNav() {
  const flags = await getChromeFlags();

  return (
    <AppNav
      moreNavItems={moreNavItems({
        advertise: flags.advertiseNav,
        blog: flags.blogNav,
      })}
      showSocialLinks={flags.socialLinks}
    />
  );
}

export async function FlaggedFooter() {
  const flags = await getChromeFlags();

  return (
    <Footer
      navItems={footerNavItems({ advertise: flags.advertiseNav })}
      showSocialLinks={flags.socialLinks}
    />
  );
}
