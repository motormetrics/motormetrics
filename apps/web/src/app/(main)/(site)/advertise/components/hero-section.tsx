import { Button, Link } from "@heroui/react";

import { SitePageHero } from "@web/components/site-page-hero";
import { SITE_TITLE } from "@web/config";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  return (
    <SitePageHero
      actions={
        <>
          <Link href="#pricing" className="no-underline">
            <Button variant="primary">
              See Plans
              <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Link href="#stats" className="no-underline">
            <Button variant="outline">View Traffic</Button>
          </Link>
        </>
      }
      description={`${SITE_TITLE} reaches an engaged, technical audience of car buyers, owners, and enthusiasts actively researching Singapore's automotive market.`}
      title="Put Your Product in Front of Car Enthusiasts"
    />
  );
}
