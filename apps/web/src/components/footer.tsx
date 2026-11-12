import { Typography } from "@heroui/react";
import { LogoMark } from "@web/components/brand-logo";
import { SITE_TITLE } from "@web/config";
import {
  FOOTER_NAV_ITEMS,
  type NavItem,
  navLinks,
  PRIMARY_NAV_ITEMS,
} from "@web/config/navigation";
import Link from "next/link";
import { version } from "../../package.json";

const COPYRIGHT_YEAR = new Date().getFullYear();

/**
 * The header pills open their sections in dropdowns, which render no anchors
 * until opened. These columns repeat the same groups as plain links, so every
 * section is reachable from every page without JavaScript.
 */
const SECTION_COLUMNS = PRIMARY_NAV_ITEMS.flatMap(
  ({ href, label, sections = [] }) =>
    sections.map((section) => ({
      label: section.label,
      links: [
        ...(section.withOverview
          ? [{ title: `${label} overview`, url: href as string }]
          : []),
        ...section.items.map(({ title, url }) => ({ title, url })),
      ],
    })),
);

export function Footer({
  navItems = FOOTER_NAV_ITEMS,
}: {
  navItems?: readonly NavItem[];
}) {
  return (
    <footer className="mt-auto flex flex-col gap-8 border-separator border-t pt-8">
      <nav aria-label="Site sections">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
          {SECTION_COLUMNS.map(({ label, links }) => (
            <li className="flex flex-col gap-3" key={label}>
              <Typography.Paragraph
                className="uppercase"
                color="muted"
                size="xs"
                weight="semibold"
              >
                {label}
              </Typography.Paragraph>
              <ul className="flex flex-col gap-2">
                {links.map(({ title, url }) => (
                  <li key={url}>
                    <Link
                      className="font-medium text-muted text-sm transition-colors hover:text-accent"
                      href={url}
                    >
                      {title}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex flex-col items-start gap-3 border-separator border-t pt-[18px] min-[721px]:flex-row min-[721px]:items-center min-[721px]:gap-4 min-[721px]:pt-5">
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
                  className="font-medium text-muted text-sm transition-colors hover:text-accent"
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
                rel="me noreferrer nofollow"
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
            rel="noopener noreferrer nofollow"
            target="_blank"
          >
            LTA DataMall
          </Link>{" "}
          · v{version}
        </Typography.Paragraph>
      </div>
    </footer>
  );
}
