import { Button, Separator, Text } from "@heroui/react";
import { BrandLogo } from "@web/components/brand-logo";
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
            <Text type="body-sm" color="muted">
              Your go-to source for Singapore car market data and trends. We
              make sense of the numbers so you don&apos;t have to.
            </Text>
            <div className="flex gap-2">
              {navLinks.socialMedia.map(({ title, url, icon: Icon }) => (
                <a key={title} href={url} rel="me noreferrer" target="_blank">
                  <Button
                    isIconOnly
                    variant="tertiary"
                    size="sm"
                    className="rounded-full text-muted transition-colors hover:text-accent"
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
            <Text type="h4">Navigation</Text>
            <div className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-muted transition-colors hover:text-accent"
                >
                  <Text type="body-sm" color="muted">
                    {item.label}
                  </Text>
                </Link>
              ))}
            </div>
            <UnreleasedFeature>
              <Separator />
              <Link
                href={POLAR_DONATION_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted transition-colors hover:text-accent"
              >
                <Heart className="size-4" />
                <Text type="body-sm" color="muted">
                  Support this project
                </Text>
              </Link>
            </UnreleasedFeature>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row md:gap-0">
          <div className="text-center text-muted md:text-left">
            <Text type="body-sm" color="muted">
              © {CURRENT_YEAR} {SITE_TITLE}. All rights reserved. • v{version}
            </Text>
            <Text type="body-sm" color="muted">
              Data provided by{" "}
              <Link
                href="https://datamall.lta.gov.sg"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                LTA DataMall
              </Link>
            </Text>
          </div>

          <div className="flex gap-4">
            <Link
              href="/legal/privacy-policy"
              className="text-muted transition-colors hover:text-accent"
            >
              <Text type="body-sm" color="muted">
                Privacy Policy
              </Text>
            </Link>
            <Link
              href="/legal/terms-of-service"
              className="text-muted transition-colors hover:text-accent"
            >
              <Text type="body-sm" color="muted">
                Terms of Service
              </Text>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
