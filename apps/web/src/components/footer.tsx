import { Typography } from "@heroui/react";
import { LogoMark } from "@web/components/brand-logo";
import { SITE_TITLE } from "@web/config";
import {
  FOOTER_NAV_ITEMS,
  type NavItem,
  navLinks,
} from "@web/config/navigation";
import Link from "next/link";
import { version } from "../../package.json";

const COPYRIGHT_YEAR = new Date().getFullYear();

export function Footer({
  navItems = FOOTER_NAV_ITEMS,
}: {
  navItems?: readonly NavItem[];
}) {
  return (
    <footer className="mt-auto flex flex-col items-start gap-3 border-separator border-t pt-[18px] min-[721px]:flex-row min-[721px]:items-center min-[721px]:gap-4 min-[721px]:pt-5">
      <Link
        aria-label={`${SITE_TITLE} home`}
        className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-separator text-foreground"
        href="/"
      >
        <LogoMark
          first="currentColor"
          second="var(--accent)"
          size={18}
          strokeWidth={8}
        />
      </Link>

      <nav aria-label="Footer navigation">
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-1.5 min-[721px]:ml-2">
          {navItems.map(({ href, label }) => (
            <li key={href}>
              <Link
                className="font-medium text-[13px] text-muted transition-colors hover:text-accent"
                href={href}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <ul className="flex items-center gap-4">
        {navLinks.socialMedia.map(({ icon: Icon, title, url }) => (
          <li key={title}>
            <Link
              aria-label={title}
              className="block text-muted transition-colors hover:text-accent"
              href={url}
              rel="me noreferrer"
              target="_blank"
            >
              <Icon aria-hidden="true" className="size-4" />
            </Link>
          </li>
        ))}
      </ul>

      <Typography.Paragraph
        className="text-left min-[721px]:ml-auto min-[721px]:text-right"
        color="muted"
        size="xs"
      >
        © {COPYRIGHT_YEAR} {SITE_TITLE} · Data from{" "}
        <Link
          className="transition-colors hover:text-accent"
          href="https://datamall.lta.gov.sg"
          rel="noopener noreferrer"
          target="_blank"
        >
          LTA DataMall
        </Link>{" "}
        · v{version}
      </Typography.Paragraph>
    </footer>
  );
}
