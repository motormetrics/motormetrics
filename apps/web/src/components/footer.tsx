import Typography from "@web/components/typography";
import { SITE_TITLE } from "@web/config";
import { FOOTER_NAV_ITEMS, navLinks } from "@web/config/navigation";
import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { version } from "../../package.json";

const COPYRIGHT_YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="mt-auto flex flex-wrap items-center gap-x-7 gap-y-4 border-separator border-t pt-6">
      <Link
        aria-label={`${SITE_TITLE} home`}
        className="flex items-center gap-3 text-foreground"
        href="/"
      >
        <TrendingUp className="size-5" strokeWidth={2.5} />
        <span className="font-extrabold text-base">
          Motor<span className="text-accent">Metrics</span>
        </span>
      </Link>

      <nav aria-label="Footer navigation">
        <ul className="flex flex-wrap items-center gap-5">
          {FOOTER_NAV_ITEMS.map(({ href, label }) => (
            <li key={href}>
              <Link
                className="font-semibold text-muted text-sm transition-colors hover:text-accent"
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

      <Typography.Caption className="ml-auto font-medium text-muted">
        © {COPYRIGHT_YEAR} {SITE_TITLE} · Data provided by{" "}
        <Link
          className="transition-colors hover:text-accent"
          href="https://datamall.lta.gov.sg"
          rel="noopener noreferrer"
          target="_blank"
        >
          LTA DataMall
        </Link>{" "}
        · v{version}
      </Typography.Caption>
    </footer>
  );
}
