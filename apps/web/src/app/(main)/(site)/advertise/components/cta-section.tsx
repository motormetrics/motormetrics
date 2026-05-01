import { Button, Card } from "@heroui/react";
import Typography from "@web/components/typography";
import { Mail } from "lucide-react";
import { cacheLife } from "next/cache";

export async function CtaSection() {
  "use cache";
  cacheLife("days");

  return (
    <section id="contact" className="scroll-mt-20 py-20 lg:py-28">
      <div className="container mx-auto">
        <div className="flex flex-col items-center gap-10">
          {/* Header */}
          <div className="flex flex-col items-center gap-4 text-center">
            <Typography.Label className="text-primary uppercase tracking-widest">
              Get in Touch
            </Typography.Label>
            <Typography.H2>Ready to reach car enthusiasts?</Typography.H2>
            <Typography.TextLg className="max-w-xl text-default-600">
              Drop us an email to discuss how we can help promote your product
              to our audience.
            </Typography.TextLg>
          </div>

          {/* Contact card */}
          <Card className="w-full max-w-md border-default-200 shadow-sm">
            <Card.Content className="flex flex-col items-center gap-4 text-center">
              <div className="rounded-xl bg-primary/10 p-3">
                <Mail className="size-6 text-primary" />
              </div>
              <Typography.H4>Email Us</Typography.H4>
              <Typography.TextSm className="text-default-500">
                For enquiries, proposals, and custom packages
              </Typography.TextSm>
              <a
                href="mailto:advertise@motormetrics.app"
                className="mt-2 no-underline"
              >
                <Button variant="primary" className="rounded-full">
                  advertise@motormetrics.app
                </Button>
              </a>
            </Card.Content>
          </Card>
        </div>
      </div>
    </section>
  );
}
