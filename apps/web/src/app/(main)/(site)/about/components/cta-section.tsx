import { buttonVariants } from "@heroui/styles";
import { SectionHead } from "@web/components/shared/overview";
import { navLinks } from "@web/config/navigation";
import Link from "next/link";

/**
 * The closing row under a hairline: where each release is posted, with the
 * social accounts and the way into the dashboard on the right. There is no
 * mailing list, so the accounts are the only channels offered.
 */
export function CtaSection() {
  return (
    <section className="flex flex-col gap-5 border-border border-t pt-4 lg:flex-row lg:items-end lg:gap-8">
      <SectionHead
        caption="New COE results and registration figures are posted as soon as they publish. Nothing else."
        className="min-w-0 flex-1"
        eyebrow="Updates"
        title="Get the numbers when they land"
      />
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
