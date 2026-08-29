import { Button } from "@heroui/react";
import Typography from "@web/components/typography";
import { navLinks } from "@web/config/navigation";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

/**
 * The comp closes on a gradient panel inviting readers to subscribe. There is
 * no mailing list, so the same panel carries the channels that do exist — the
 * social accounts each release is posted to.
 *
 * `--accent-gradient` is fixed blue in both themes, so the copy takes
 * `--ink-surface-foreground` (white either way) rather than a token that flips.
 */
export function CtaSection() {
  return (
    <section className="flex flex-col items-start gap-8 rounded-4xl bg-[image:var(--accent-gradient)] p-8 text-ink-surface-foreground lg:flex-row lg:items-center lg:p-14">
      <div className="flex max-w-prose flex-col gap-3">
        <Typography.H2 className="text-ink-surface-foreground lg:text-4xl">
          Get the numbers when they land
        </Typography.H2>
        <Typography.Text className="text-ink-surface-foreground/85 text-lg leading-normal">
          New COE results and registration figures are posted as soon as they
          publish. Nothing else.
        </Typography.Text>
        <div className="flex flex-wrap gap-3 pt-2">
          {navLinks.socialMedia.map(({ icon: Icon, title, url }) => (
            <a
              className="inline-flex items-center gap-2 rounded-full border border-ink-surface-foreground/25 px-4 py-2 font-semibold text-ink-surface-foreground text-sm no-underline transition-colors hover:bg-ink-surface-foreground/10"
              href={url}
              key={title}
              rel="me noreferrer"
              target="_blank"
            >
              <Icon className="size-4" />
              {title}
            </a>
          ))}
        </div>
      </div>
      <Link className="no-underline lg:ml-auto" href="/">
        <Button className="rounded-full" size="lg" variant="secondary">
          Explore the dashboard
          <ArrowUpRight className="size-4" />
        </Button>
      </Link>
    </section>
  );
}
