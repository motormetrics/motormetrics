import { Link as HeroLink, Tooltip } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { BrandLogo } from "@web/components/brand-logo";
import Typography from "@web/components/typography";
import { UnreleasedFeature } from "@web/components/unreleased-feature";
import { SITE_TITLE } from "@web/config";
import {
  NAV_ITEMS,
  navLinks,
  POLAR_DONATION_URL,
} from "@web/config/navigation";
import { Heart } from "lucide-react";
import Link from "next/link";
import { version } from "../../package.json";

const CURRENT_YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-separator border-t bg-surface">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(14rem,0.5fr)]">
          {/* Brand Section */}
          <div className="flex flex-col gap-4">
            <BrandLogo />
            <Typography.TextSm>
              Your go-to source for Singapore car market data and trends. We
              make sense of the numbers so you don&apos;t have to.
            </Typography.TextSm>
            <div className="flex gap-2">
              {navLinks.socialMedia.map(({ title, url, icon: Icon }) => (
                <Tooltip key={title} delay={300}>
                  <HeroLink
                    aria-label={title}
                    className={buttonVariants({
                      className: "size-10 text-muted hover:text-accent",
                      isIconOnly: true,
                      variant: "tertiary",
                    })}
                    href={url}
                    rel="me noreferrer"
                    target="_blank"
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </HeroLink>
                  <Tooltip.Content>{title}</Tooltip.Content>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Navigation Section */}
          <div className="flex flex-col gap-4">
            <Typography.H4>Navigation</Typography.H4>
            <div className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-muted transition-colors hover:text-accent"
                >
                  <Typography.TextSm>{item.label}</Typography.TextSm>
                </Link>
              ))}
            </div>
            <UnreleasedFeature>
              <Link
                href={POLAR_DONATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted transition-colors hover:text-accent"
              >
                <Heart className="size-4" />
                <Typography.TextSm>Support this project</Typography.TextSm>
              </Link>
            </UnreleasedFeature>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-separator border-t pt-6 md:flex-row md:gap-0">
          <div className="text-center text-muted md:text-left">
            <Typography.TextSm>
              © {CURRENT_YEAR} {SITE_TITLE}. All rights reserved. • v{version}
            </Typography.TextSm>
            <Typography.TextSm>
              Data provided by{" "}
              <Link
                href="https://datamall.lta.gov.sg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                LTA DataMall
              </Link>
            </Typography.TextSm>
          </div>

          <div className="flex gap-4">
            <Link
              href="/legal/privacy-policy"
              className="text-muted transition-colors hover:text-accent"
            >
              <Typography.TextSm>Privacy Policy</Typography.TextSm>
            </Link>
            <Link
              href="/legal/terms-of-service"
              className="text-muted transition-colors hover:text-accent"
            >
              <Typography.TextSm>Terms of Service</Typography.TextSm>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
