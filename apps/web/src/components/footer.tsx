import { Button, Separator } from "@heroui/react";
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
    <footer className="border-divider border-t bg-surface">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Brand Section */}
          <div className="flex flex-col gap-4">
            <BrandLogo />
            <Typography.TextSm>
              Your go-to source for Singapore car market data and trends. We
              make sense of the numbers so you don&apos;t have to.
            </Typography.TextSm>
            <div className="flex gap-2">
              {navLinks.socialMedia.map(({ title, url, icon: Icon }) => (
                <a key={title} href={url} rel="me noreferrer" target="_blank">
                  <Button
                    isIconOnly
                    variant="tertiary"
                    size="sm"
                    className="rounded-full text-default-500 transition-colors hover:text-primary"
                    aria-label={title}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                  </Button>
                </a>
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
                  className="block text-default-600 transition-colors hover:text-primary"
                >
                  <Typography.TextSm>{item.label}</Typography.TextSm>
                </Link>
              ))}
            </div>
            <UnreleasedFeature>
              <Separator />
              <Link
                href={POLAR_DONATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-default-600 transition-colors hover:text-primary"
              >
                <Heart className="size-4" />
                <Typography.TextSm>Support this project</Typography.TextSm>
              </Link>
            </UnreleasedFeature>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:gap-0">
          <div className="text-center text-default-600 md:text-left">
            <Typography.TextSm>
              © {CURRENT_YEAR} {SITE_TITLE}. All rights reserved. • v{version}
            </Typography.TextSm>
            <Typography.TextSm>
              Data provided by{" "}
              <Link
                href="https://datamall.lta.gov.sg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                LTA DataMall
              </Link>
            </Typography.TextSm>
          </div>

          <div className="flex gap-4">
            <Link
              href="/legal/privacy-policy"
              className="text-default-600 transition-colors hover:text-primary"
            >
              <Typography.TextSm>Privacy Policy</Typography.TextSm>
            </Link>
            <Link
              href="/legal/terms-of-service"
              className="text-default-600 transition-colors hover:text-primary"
            >
              <Typography.TextSm>Terms of Service</Typography.TextSm>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
