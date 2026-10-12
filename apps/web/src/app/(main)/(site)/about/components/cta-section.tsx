import { Typography } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { navLinks } from "@web/config/navigation";
import Link from "next/link";

/**
 * The closing panel: where each release is posted, on a bordered surface with
 * the social accounts and the way into the dashboard on the right. There is no
 * mailing list, so the accounts are the only channels offered.
 */
export function CtaSection() {
  return (
    <section className="flex flex-col gap-5 rounded-lg border border-separator bg-surface px-4 py-5 md:px-7 md:py-6 lg:flex-row lg:items-center lg:gap-8">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <Typography.Heading
          className="text-xl md:text-2xl"
          level={2}
          weight="bold"
        >
          Get the numbers when they land
        </Typography.Heading>
        <Typography.Paragraph className="max-w-xl text-muted-strong">
          New COE results and registration figures are posted as soon as they
          publish. Nothing else.
        </Typography.Paragraph>
      </div>
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap">
          {navLinks.socialMedia.map(({ icon: Icon, title, url }) => (
            <a
              className={buttonVariants({ variant: "outline" })}
              href={url}
              key={title}
              rel="me noreferrer nofollow"
              target="_blank"
            >
              <Icon aria-hidden className="size-4" />
              {title}
            </a>
          ))}
        </div>
        <Link className={buttonVariants({ variant: "primary" })} href="/">
          Explore the dashboard
        </Link>
      </div>
    </section>
  );
}
